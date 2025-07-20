import React, { FC, ReactNode, useEffect, useCallback } from 'react';
import moment from 'moment';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  GRID_ACTIONS,
  ISelectOption,
  MODEL_STATUS,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { AssociatedSiteRefModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AlertStore } from '@uvgo-shared/alert';
import { AssociatedRegistrySiteModel } from '../../../Models';
import { useCustomerModuleSecurity } from '../../../Tools';
import classNames from 'classnames';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { useStyles } from './RegistrySites.style';
import { useNavigate, useParams } from 'react-router';
import { upsertAssociatedRegistryBackNavLink } from '../../CustomerSidebarOptions/CustomerSidebarOptions';
import { CustomerStore, RegistryStore } from '../../../Stores';
import { finalize, takeUntil } from 'rxjs/operators';
import { observable } from 'mobx';

type Props = {
  customerStore?: CustomerStore;
  registryStore?: RegistryStore;
};

const RegistrySites: FC<Props> = ({ customerStore, registryStore }) => {
  const gridState = useGridState();
  const params = useParams();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<'', AssociatedRegistrySiteModel>([], gridState);
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent<AssociatedRegistrySiteModel>({}, {}, baseEntitySearchFilters);
  const _customerStore = customerStore as CustomerStore;
  const _registryStore = registryStore as RegistryStore;
  const defaultDisabledColumns = [ 'startDate', 'endDate' ];
  const customerModuleSecurity = useCustomerModuleSecurity();

  const _observable = observable<any>({
    startDate: '',
    endDate: '',
    disabledColumns: defaultDisabledColumns,
    isAdjustDate: false,
    site: new AssociatedRegistrySiteModel(),
    isNullEndDate: false,
  });

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.registryViewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    if (_registryStore.selectedAssociatedRegistry.id) {
      loadInitialData();
    }
  }, [ _registryStore.selectedAssociatedRegistry.id ]);

  const mapSitesWithLocation = (response: AssociatedRegistrySiteModel[]) => {
    const customerAssociatedSites = _customerStore.selectedCustomer.associatedSites;
    const filteredResponse = customerAssociatedSites.filter(site =>
      response.some(customerSite => customerSite.site.siteUseId === site.siteUseId)
    );
    const updatedResponse = response.map(responseSite => {
      const matchedSite = filteredResponse.find(site => site.siteUseId === responseSite.site.siteUseId);
      if (matchedSite) {
        return new AssociatedRegistrySiteModel({
          ...responseSite,
          site: new AssociatedSiteRefModel({
            ...responseSite.site,
            location: matchedSite.location || '',
          }),
        });
      }
    });
    gridState.setGridData(updatedResponse);
  };

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _customerStore
      .getAssociatedRegistrySites(_customerStore.selectedCustomer?.number, _registryStore.selectedAssociatedRegistry.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        mapSitesWithLocation(response);
      });
  };

  // get min start end date
  const getMinStartDate = (rowData: AssociatedRegistrySiteModel) => {
    const { id, endDate } = rowData;
    const siteId = _observable.site?.id;
    const sameSitesWithEndDates = gridState.data
      .filter(x => x.endDate && x.site?.id === siteId && id !== x.id)
      .map(x => moment(x.endDate, DATE_FORMAT.API_FORMAT));

    if (!sameSitesWithEndDates.length) {
      return;
    }
    // If there is no recoed then we need to calcluate the max end date so
    //that new start date should be one day greater than max end date
    if (id === 0 || !endDate) {
      const maxDate = moment.max(sameSitesWithEndDates);
      maxDate.add(1, 'day');
      return maxDate.format(DATE_FORMAT.API_FORMAT);
    }
    //Existing records
    // Filter the dates that are less than the current rowData.endDate and belong to the same site
    const datesBeforeSelectedEndDate = sameSitesWithEndDates.filter(x =>
      moment(x, DATE_FORMAT.API_FORMAT).isBefore(moment(endDate, DATE_FORMAT.API_FORMAT))
    );

    // // If no valid dates, no minimum start date is required
    if (!datesBeforeSelectedEndDate.length) {
      return;
    }
    const maxDate = moment.max(datesBeforeSelectedEndDate);
    maxDate.add(1, 'day');
    return maxDate.format(DATE_FORMAT.API_FORMAT);
  };

  /* istanbul ignore next */
  const getValidMaxStartDate = (rowData: AssociatedRegistrySiteModel) => {
    const { id, startDate } = rowData;
    const siteId = _observable.site?.id;

    // Get all records for the same site, excluding the current one
    const sameSiteRecords = gridState.data.filter(x => x.site?.id === siteId && id !== x.id);

    // 1. If the current record has an endDate, use it as max date for the startDate
    if (_observable.endDate) {
      return moment(_observable.endDate, DATE_FORMAT.API_FORMAT).format(DATE_FORMAT.API_FORMAT);
    }

    // 2. If no other records with the same site, no validation required
    if (!sameSiteRecords.length) {
      return; // No max date validation needed
    }

    // 3. Find records with start dates greater than the current record's start date
    const futureStartDates = sameSiteRecords
      .filter(
        x =>
          x.startDate && moment(x.startDate, DATE_FORMAT.API_FORMAT).isAfter(moment(startDate, DATE_FORMAT.API_FORMAT))
      )
      .map(x => moment(x.startDate, DATE_FORMAT.API_FORMAT));

    // 4. If no future records with a start date greater than the current one, no validation required
    if (!futureStartDates.length) {
      return; // No max date validation needed
    }

    // 5. Find the earliest future start date and return one day less than that date
    const minFutureStartDate = moment.min(futureStartDates);
    minFutureStartDate.subtract(1, 'day');
    return minFutureStartDate.format(DATE_FORMAT.API_FORMAT);
  };

  /* istanbul ignore next */
  //min end date in case of inactive
  const getMinEndDate = ({ startDate, site, id }: AssociatedRegistrySiteModel) => {
    if (startDate === 'Invalid date') {
      return;
    }
    // current date time is required by date time picker
    const tempDate = new Date();
    const _startDate = new Date(_observable.site.startDate);
    const validDates = gridState.data
      .filter(x => x.endDate && x.site.id === site.id && id !== x.id)
      .map(x => new Date(x.endDate));

    // if only one record then we need to consider start date
    if (validDates.length < 2) {
      validDates.push(_startDate);
    }

    // Finding the maximum date
    const maxDate = new Date(Math.max(...([ ...validDates ] as any)));
    const isStartDateGreater = _startDate.getTime() >= maxDate.getTime();
    const maxEndDate = isStartDateGreater ? _startDate : maxDate;

    // if startdate is less than max date then add one day
    if (!isStartDateGreater) {
      maxEndDate.setDate(maxEndDate.getDate() + 1);
    }
    maxEndDate.setHours(tempDate.getHours());
    maxEndDate.setMinutes(tempDate.getMinutes());
    return maxEndDate;
  };

  //Validation for max end date in case of active sites
  const setMaxEndDate = ({ id, startDate, site }: AssociatedRegistrySiteModel) => {
    // if there is new record then there is no validation on max end date
    if (id === 0) {
      return '';
    }
    //For existing records
    const rowDataStartDate = moment(startDate, DATE_FORMAT.API_FORMAT);
    const validDates = gridState.data
      .filter(
        x =>
          x.startDate &&
          x.site?.id === site?.id &&
          id !== x?.id &&
          moment(x.startDate, DATE_FORMAT.API_FORMAT).isAfter(rowDataStartDate)
      )
      .map(x => moment(x.startDate, DATE_FORMAT.API_FORMAT));

    // if there id new record then there sould be no validation on max end dat
    if (validDates.length < 1) {
      return '';
    }

    //get the minimun start value
    const minStartDate = moment.min(validDates);

    // Compare the startDate of rowData with the adjustedMinStartDate
    if (rowDataStartDate.isAfter(minStartDate)) {
      return '';
    }
    // max end date should be one day less than the existing start date
    const adjustedMinStartDate = minStartDate.subtract(1, 'day');
    return adjustedMinStartDate.format(DATE_FORMAT.API_FORMAT);
  };

  //set min end date in case of active
  const setMinEndDate = rowData => {
    if (_registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.IN_ACTIVE) {
      return _observable.startDate;
    }
    return _observable.site.startDate ? _observable.site.startDate : rowData.data.startDate;
  };

  const clear = () => {
    _observable.startDate = '';
    _observable.endDate = '';
    _observable.disabledColumns = defaultDisabledColumns;
    _observable.site = new AssociatedRegistrySiteModel();
    _observable.isNullEndDate = false;
  };

  const onInputChange = (params, value) => {
    switch (params.colDef.field) {
      case 'startDate':
        const rowData = getUpdatedModel(params.node.rowIndex, [ 'site' ]);
        const hasEndDate = _observable.endDate && rowData.endDate;
        _observable.isNullEndDate = hasEndDate ? !hasEndDate : checkNullEndDate(params.node.rowIndex);
        if (!value) {
          _observable.disabledColumns = [ 'endDate' ];
          agGrid.fetchCellInstance('endDate').setValue('');
          _observable.endDate = '';
          _observable.startDate = value;
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
          return;
        }
        _observable.disabledColumns = [];
        const siteId = rowData?.site?.id;
        const sameSites = gridState.data.filter(x => x.endDate && x.site.id === siteId);
        _observable.site.startDate = value;
        _observable.maxEndDate = setMaxEndDate(rowData);
        //while updating if there is one record then need to check with the current start value otherwise the max value
        _observable.startDate = sameSites.length === 1 ? value : getMinEndDate(rowData);
        break;
      case 'endDate':
        _observable.endDate = value;
        checkNullEndDate(params.node.rowIndex, value);
        if (
          !value &&
          _registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.ACTIVE &&
          _observable.isNullEndDate
        ) {
          gridState.setHasError(true);
          agGrid.fetchCellInstance('tssView').setValue(false);
          agGrid.showAlert('Only most recent site can have null end date', 'registrySiteAlertMessage');
          return;
        }
        if (
          !value ||
          (!Utilities.isDateInThePast(value) &&
            !Utilities.isSameDate(value, Utilities.getCurrentDate, DATE_FORMAT.API_DATE_FORMAT))
        ) {
          agGrid.fetchCellInstance('tssView').setValue(true);
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
          return;
        }
        agGrid.fetchCellInstance('tssView').setValue(false);
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (params, value) => {
    if (Utilities.isEqual(params.colDef.field, 'site')) {
      agGrid.fetchCellInstance('site.location').setValue(value?.location || '');
      if (!Boolean(value?.id)) {
        _observable.disabledColumns = defaultDisabledColumns;
        agGrid.fetchCellInstance('startDate').setValue('');
        agGrid.fetchCellInstance('endDate').setValue('');
        return;
      }
      _observable.site = value;
      _observable.disabledColumns = [ 'endDate' ];
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const getUpdatedModel = (rowIndex, columns) => {
    const tableItem = agGrid._getTableItem(rowIndex);
    columns.forEach(element => (tableItem[element] = agGrid.getInstanceValue(element)));
    return tableItem;
  };

  /* istanbul ignore next */
  const isAlreadyExists = (rowIndex: number): boolean => {
    const siteModel = getUpdatedModel(rowIndex, [ 'startDate', 'endDate', 'site' ]);
    const startDateNew = Utilities.getformattedDate(siteModel.startDate, DATE_FORMAT.DATE_PICKER_FORMAT);
    const endDateNew = Utilities.getformattedDate(siteModel.endDate, DATE_FORMAT.DATE_PICKER_FORMAT);
    const isExists = gridState.data.some(record => {
      if (
        record.site?.id === siteModel.site?.id &&
        record.id !== siteModel.id &&
        !record.endDate &&
        !siteModel.endDate
      ) {
        return !Boolean(siteModel.endDate);
      }
      const startDate = Utilities.getformattedDate(record.startDate, DATE_FORMAT.DATE_PICKER_FORMAT);
      const endDate = Utilities.getformattedDate(record.endDate, DATE_FORMAT.DATE_PICKER_FORMAT);
      return (
        record.site?.id === siteModel.site?.id &&
        record.id !== siteModel.id &&
        startDateNew === startDate &&
        endDateNew === endDate
      );
    });

    if (isExists) {
      agGrid.showAlert(
        !siteModel.endDate
          ? 'For Any Site only one Record can have End Date as Blank or open End Date'
          : 'Combination of Site, Start Date and End Date should be unique.',
        'registrySiteAlertMessage'
      );
    }
    return isExists;
  };

  const checkNullEndDate = (rowIndex: number, value?) => {
    const currentRow = getUpdatedModel(rowIndex, [ 'site' ]);
    // Check if this is the latest record for the site
    const siteId = currentRow.site?.id;
    const sameSiteRecords = gridState.data.filter(record => record.site?.id === siteId);
    if (sameSiteRecords.length && Boolean(currentRow.id)) {
      const latestRecord = sameSiteRecords.reduce((latest, record) => {
        const recordDate = moment(record.startDate, DATE_FORMAT.API_FORMAT);
        const latestDate = moment(latest.startDate, DATE_FORMAT.API_FORMAT);
        return recordDate.isAfter(latestDate) ? record : latest;
      }, sameSiteRecords[0]);
      // If the current row is not the latest, it cannot have a null endDate
      if (latestRecord !== currentRow && !value) {
        _observable.disabledColumns = [ 'tssView' ];
        _observable.isNullEndDate = true;
        return true;
      }
      _observable.isNullEndDate = false;
      return false;
    }
  };

  /* istanbul ignore next */
  const upsertAssociatedRegistrySite = (rowIndex): void => {
    if (isAlreadyExists(rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const data: AssociatedRegistrySiteModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _customerStore
      .upsertAssociatedRegistrySite(data, params.customerNumber || '', _registryStore.selectedAssociatedRegistry.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AssociatedRegistrySiteModel) => {
          const matchSite = _customerStore.selectedCustomer.associatedSites.find(
            site => site.siteUseId === response.site.siteUseId
          );
          const _updatedResponse = new AssociatedRegistrySiteModel({
            ...response,
            site: new AssociatedSiteRefModel({
              ...response.site,
              location: matchSite?.location || '',
            }),
          });
          agGrid._updateTableItem(rowIndex, _updatedResponse);
          clear();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, columnDefs[2].field || '');
          AlertStore.critical(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[2].field || '');
        const rowData = gridState.gridApi.getRowNode(String(rowIndex))?.data;
        _observable.disabledColumns = [];
        _observable.site.startDate = rowData?.startDate;
        _observable.startDate = getMinEndDate(rowData);
        _observable.endDate = rowData.endDate;
        _observable.site = rowData.site;
        _observable.maxEndDate = setMaxEndDate(rowData);
        break;
      case GRID_ACTIONS.ADJUST_DATE:
        _observable.isAdjustDate = true;
        _observable.disabledColumns = [];
        agGrid._startEditingCell(rowIndex, columnDefs[3].field || '');
        const _rowData = gridState.gridApi.getRowNode(String(rowIndex))?.data;
        _observable.site.startDate = _rowData?.startDate;
        _observable.startDate = getMinEndDate(_rowData);
        _observable.endDate = _rowData.endDate;
        break;
      case GRID_ACTIONS.SAVE:
        upsertAssociatedRegistrySite(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        clear();
        break;
    }
  };

  const isOptionDisabled = useCallback(option => gridState.data.some(x => x.site.id === option.siteId && !x.endDate), [
    gridState.data,
  ]);

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Site Id',
      field: 'site',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      minWidth: 120,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.id || '',
      cellEditorParams: {
        isRequired: true,
        showTooltip: true,
        placeHolder: 'Site Id',
        getAutoCompleteOptions: () => _customerStore.selectedCustomer.associatedSites,
        valueGetter: (option: ISelectOption) => option,
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
        getOptionDisabled: option => isOptionDisabled(option),
        getOptionTooltip: option =>
          isOptionDisabled(option) ? 'Disabled because this site is not end dated yet!' : '',
      },
    },
    {
      headerName: 'Location ( Site Name )',
      field: 'site.location',
      filter: false,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Location (Site Name)',
        getDisableState: () => true,
      },
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Start Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        minDate: rowData => getMinStartDate(rowData.data),
        maxDate: rowData =>
          _registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.ACTIVE
            ? getValidMaxStartDate(rowData.data)
            : _observable.endDate,
        getDisableState: () => _observable.disabledColumns.includes('startDate'),
      },
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'End Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        placeHolder: 'End Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        minDate: rowData => setMinEndDate(rowData),
        maxDate: () =>
          _registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.ACTIVE && _observable.maxEndDate,
        getDisableState: () => _observable.disabledColumns.includes('endDate'),
        isRequired: () => _observable.isAdjustDate,
      },
    },
    {
      headerName: 'TSS View',
      field: 'tssView',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      minWidth: 135,
      maxWidth: 135,
      cellRendererParams: { readOnly: true },
      cellEditorParams: {
        getDisableState: () => {
          return (
            _observable.disabledColumns.includes('tssView') ||
            Utilities.isDateInThePast(_observable.endDate) ||
            Utilities.isSameDate(_observable.endDate, Utilities.getCurrentDate, DATE_FORMAT.API_DATE_FORMAT)
          );
        },
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          getVisibleState: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: _registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.IN_ACTIVE,
              action: GRID_ACTIONS.EDIT,
            },
            {
              title: 'Adjust Date',
              action: GRID_ACTIONS.ADJUST_DATE,
              isHidden: _registryStore.selectedAssociatedRegistry.statusId !== MODEL_STATUS.IN_ACTIVE,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange,
      },
      columnDefs,
      isEditable: useUpsert.isEditView,
      gridActionProps: {
        hideActionButtons: !customerModuleSecurity.isEditable || !useUpsert.isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError || _observable.isNullEndDate,
        getEditDisabledState: (data: AssociatedRegistrySiteModel) =>
          Boolean(data?.endDate) || _registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.IN_ACTIVE,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressClickEdit: true,
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: customerModuleSecurity.isEditable,
        isParentRowEditing: () => gridState.isRowEditing,
      },
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => agGrid.onRowEditingStarted(params),
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.registryViewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(upsertAssociatedRegistryBackNavLink(params.customerNumber || '', params.viewMode || ''));
        break;
    }
  };

  /* istanbul ignore next */
  const addAssociatedRegistrySite = () => {
    const associatedRegistrySite = new AssociatedRegistrySiteModel({ id: 0, tssView: true });
    agGrid.addNewItems([ associatedRegistrySite ], { startEditing: false, colKey: 'site' });
    gridState.setHasError(true);
  };

  const isDisabled = () => {
    return (
      !useUpsert.isEditable ||
      gridState.hasError ||
      gridState.isRowEditing ||
      UIStore.pageLoading ||
      _registryStore.selectedAssociatedRegistry.statusId === MODEL_STATUS.IN_ACTIVE
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_customerStore.selectedCustomer.name}
        backNavTitle="Associated Registry"
        backNavLink={params && upsertAssociatedRegistryBackNavLink(params.customerNumber || '', params.viewMode || '')}
        disableActions={useUpsert.isActionDisabled}
        isEditMode={useUpsert.isEditable}
        isSaveVisible={false}
        isActive={params.registryViewMode === VIEW_MODE.DETAILS.toLowerCase()}
        hasEditPermission={customerModuleSecurity.isEditable}
        onAction={action => onAction(action)}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        isBreadCrumb={true}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <div className={classNames({ [classes.root]: true, [classes.masterDetails]: true })}>
          <AgGridMasterDetails
            addButtonTitle="Add Site"
            onAddButtonClick={addAssociatedRegistrySite}
            hasAddPermission={customerModuleSecurity.isEditable}
            disabled={isDisabled()}
            key={`master-details-${useUpsert.isEditable}`}
          >
            <CustomAgGridReact
              isRowEditing={gridState.isRowEditing}
              rowData={gridState.data}
              gridOptions={gridOptions()}
              classes={{ customHeight: classes.customHeight }}
            />
          </AgGridMasterDetails>
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('customerStore', 'registryStore')(observer(RegistrySites));

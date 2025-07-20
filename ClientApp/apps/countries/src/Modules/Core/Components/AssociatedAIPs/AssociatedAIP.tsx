import React, { FC, useEffect } from 'react';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ICellEditorParams,
  ValueFormatterParams,
  RowEditingStartedEvent,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import classNames from 'classnames';
import { CountryModel, VIEW_MODE } from '@wings/shared';
import { CountryStore, SettingsStore } from '../../../Shared/Stores';
import { AeronauticalInformationPublicationModel, AssociatedAIPModel } from '../../../Shared/Models';
import { AlertStore } from '@uvgo-shared/alert';
import { AIP_FILTERS, upsertCountryBackNavLink, useCountryModuleSecurity } from '../../../Shared';
import { useStyles } from './AssociatedAIP.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  IAPIGridRequest,
  UIStore,
  Utilities,
  SettingsTypeModel,
  GRID_ACTIONS,
  cellStyle,
  rowStyle,
} from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import {
  AgColumnHeader,
  AgGridCellEditor,
  AgGridMasterDetails,
  AgGridLinkView,
  AgGridAutoComplete,
  AgGridActions,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { useParams } from 'react-router';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { observable } from 'mobx';

interface Props extends Partial<ICellRendererParams> {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  countryId: number;
  isEditable?: boolean;
  title?: string;
  countryModel?: CountryModel;
  params?: { viewMode: VIEW_MODE; countryId: number; continentId: number };
}

const aip = 'aeronauticalInformationPublication';

const AssociatedAIP: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIP_FILTERS, AssociatedAIPModel>([], gridState);
  const alertMessageId: string = 'AIPAlertMessage';
  const _useConfirmDialog = useConfirmDialog();
  const countryModuleSecurity = useCountryModuleSecurity();
  const disabledColumns: string[] = [ `${aip}.description`, `${aip}.aipUsername`, `${aip}.aipPassword` ];
  const _link = observable({
    data: [] as SettingsTypeModel[],
    allLinks: [] as AeronauticalInformationPublicationModel[],
    aip: new AeronauticalInformationPublicationModel(),
  });
  const _settingsStore = props.settingsStore as SettingsStore;
  const _countryStore = props.countryStore as CountryStore;
  const isEditable = props.isEditable;

  /* istanbul ignore next */
  useEffect(() => {
    if (!Boolean(gridState.data.length)) {
      loadAssociatedAIP(props.countryId);
      _settingsStore.getAIPSourceTypes().subscribe();
    }
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
  }, [ isEditable ]);

  /* istanbul ignore next */
  const loadAssociatedAIP = (countryId: number) => {
    if (!countryId) {
      return;
    }
    UIStore.setPageLoader(true);
    _countryStore
      ?.getAssociatedAIP(countryId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(countryAip => {
        gridState.setGridData(countryAip);
      });
  };

  /* istanbul ignore next */
  const fetchAipLinks = (aipSourceTypeId: number) => {
    const filterCollection = JSON.stringify([
      { propertyName: 'AIPSourceType.AIPSourceTypeId', propertyValue: aipSourceTypeId },
    ]);

    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 0,
      filterCollection,
    };

    _countryStore
      ?.getAeronauticalInformationPublication(0, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const { results } = response;
        _link.allLinks = results;
        const _linkData = results.map(x => {
          return new SettingsTypeModel({ name: x.aipLink, id: x.id });
        });
        _link.data = _linkData;
      });
  };

  const isAlreadyAssociated = (associatedAIPModel: AssociatedAIPModel) => {
    const country = associatedAIPModel?.country;
    const isDuplicateData = gridState.data?.some(a => a.aeronauticalInformationPublication?.id === _link.aip?.id);

    if (isDuplicateData) {
      agGrid.showAlert(
        `This AIP with Link:${_link.aip?.aipLink} and Type:${_link.aip?.aipSourceType?.label} is already associated with Country ${country.name}`,
        alertMessageId
      );
      return true;
    }
    return false;
  };

  const upsertAssociatedAIP = (rowIndex: number) => {
    const data: AssociatedAIPModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyAssociated(data)) {
      return;
    }
    gridState.gridApi.stopEditing();

    UIStore.setPageLoader(true);
    _countryStore
      ?.upsertAssociatedAIP(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AssociatedAIPModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const deleteAssociatedAIP = (rowIndex: number) => {
    const data: AssociatedAIPModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ModalStore.close();
    _countryStore
      ?.removeAssociatedAIP(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ data ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const clearValues = () => {
    [ 'link', 'description', 'aipUsername', 'aipPassword' ].map(x =>
      agGrid.getComponentInstance(`${aip}.${x}`).setValue('')
    );
    return;
  };

  const onDropDownChange = (params: ICellEditorParams, value: any) => {
    if (!value) {
      clearValues();
      return;
    }

    if (Utilities.isEqual(params.colDef.field as string, `${aip}.aipSourceType`)) {
      const selectedType = value;
      clearValues();
      fetchAipLinks(selectedType.id);
      return;
    }

    if (Utilities.isEqual(params.colDef.field as string, `${aip}.link`)) {
      const _aip = _link.allLinks.find(x => x.id === value.id) as AeronauticalInformationPublicationModel;
      _link.aip = _aip;
      agGrid.getComponentInstance(`${aip}.description`).setValue(_aip?.description as string);
      agGrid.getComponentInstance(`${aip}.aipUsername`).setValue(_aip?.aipUsername as string);
      agGrid.getComponentInstance(`${aip}.aipPassword`).setValue(_aip?.aipPassword as string);
      gridState.setHasError(false);
      return;
    }
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange,
        onInputChange,
      },
      columnDefs,
      isEditable,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      getRowStyle: () => rowStyle(gridState.isRowEditing, Boolean(isEditable)),
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customCellEditor: AgGridCellEditor,
        actionRenderer: AgGridActions,
        agColumnHeader: AgColumnHeader,
        agGridLink: AgGridLinkView,
        customAutoComplete: AgGridAutoComplete,
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
      },
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
        if (params.data.id && params.data.aeronauticalInformationPublication?.aipSourceType?.id) {
          fetchAipLinks(params.data.aeronauticalInformationPublication.aipSourceType.id);
        }
      },
    };
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAssociatedAIP(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(() => deleteAssociatedAIP(rowIndex), { isDelete: true });
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Type',
      field: `${aip}.aipSourceType`,
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'AIP Source Type',
        getAutoCompleteOptions: () => _settingsStore?.aipSourceTypes,
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
    {
      headerName: 'Link',
      field: `${aip}.link`,
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      cellRenderer: 'agGridLink',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Link',
        getAutoCompleteOptions: () => _link.data,
        valueGetter: (option: SettingsTypeModel) => option,
        formatValue: value => value?.name,
      },
    },
    {
      headerName: 'Description',
      field: `${aip}.description`,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('description', 2),

      cellEditorParams: {
        rules: 'required|string|between:1,200',
        ignoreNumber: true,
        getDisableState: () => disabledColumns.includes(`${aip}.description`),
      },
    },
    {
      headerName: 'User Name',
      field: `${aip}.aipUsername`,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aipUsername', 2),
      cellEditorParams: {
        rules: 'required|string|between:1,50',
        ignoreNumber: true,
        getDisableState: () => disabledColumns.includes(`${aip}.aipUsername`),
      },
    },
    {
      headerName: 'Password',
      field: `${aip}.aipPassword`,
      cellEditorParams: {
        rules: 'required|string|between:1,50',
        ignoreNumber: true,
        getDisableState: () => disabledColumns.includes(`${aip}.aipPassword`),
      },
    },
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 150,
      minWidth: 130,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          { title: 'Edit', isHidden: !isEditable, action: GRID_ACTIONS.EDIT },
          { title: 'Delete', isHidden: !isEditable, action: GRID_ACTIONS.DELETE },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  const addAssociatedAIP = () => {
    const associatedAIPModel = new AssociatedAIPModel({
      id: 0,
      aeronauticalInformationPublication: new AeronauticalInformationPublicationModel(),
      country: _countryStore?.selectedCountry,
    });

    agGrid.addNewItems([ associatedAIPModel ], {
      startEditing: false,
      colKey: `${aip}.aipSourceType`,
    });
    gridState.setHasError(true);
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const headerActions = () => {
    return (
      <DetailsEditorHeaderSection
        title={props.title}
        backNavLink={params && upsertCountryBackNavLink(Number(params.continentId))}
        backNavTitle={params?.countryId ? 'Countries' : 'Continents'}
        isEditMode={false}
        showBreadcrumb={Boolean(params?.continentId)}
      />
    );
  };
  return (
    <DetailsEditorWrapper
      headerActions={headerActions()}
      isEditMode={false}
      isBreadCrumb={Boolean(params?.continentId)}
    >
      <div className={classNames({ [classes.root]: true, [classes.masterDetails]: true })}>
        <AgGridMasterDetails
          addButtonTitle="Add AIP"
          onAddButtonClick={addAssociatedAIP}
          hasAddPermission={countryModuleSecurity.isEditable}
          disabled={gridState.isRowEditing || !isEditable}
          key={`master-details-${isEditable}`}
        >
          <CustomAgGridReact
            rowData={gridState.data}
            gridOptions={gridOptions()}
            isRowEditing={gridState.isRowEditing}
          />
        </AgGridMasterDetails>
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('countryStore', 'settingsStore')(observer(AssociatedAIP));

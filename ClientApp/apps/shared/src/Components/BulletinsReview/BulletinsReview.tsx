import React, { FC, useEffect, useMemo, useState } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { Grid } from '@material-ui/core';
import { BulletinReviewModel } from '../../Models';
import { SidebarStore } from '@wings-shared/layout';
import { finalize, takeUntil } from 'rxjs/operators';
import { useStyles } from './BulletinsReview.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { BulletinStore } from '../Bulletins/Stores/Bulletin.store';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import UplinkReviewActions from '../UplinkReviewActions/UplinkReviewActions';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { BULLETIN_COMPARISON_TYPE, BULLETIN_MERGE_STATUS, BULLETIN_REVIEW_FILTERS } from '../../Enums';
import StagingFieldsRenderer from '../StagingFieldsRenderer/StagingFieldsRenderer';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import {
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IdNameCodeModel,
  INavigationLink,
  ISelectOption,
  MenuItem,
  UIStore,
  Utilities,
} from '@wings-shared/core';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { comparisonType, getGridData, isDataMerged, isDataRejected, mergeStatus, mergeStatusOptions } from './fields';

interface Props {
  securityModule: any;
  isAirport: boolean;
  bulletinStore?: BulletinStore;
  sidebarStore?: typeof SidebarStore;
  defaultSidebarOptions?: (defaultOptions: boolean, isDisabled?: boolean) => MenuItem[] | INavigationLink[];
  basePath?: string;
}

const BulletinsReview: FC<Props> = ({ ...props }) => {
  const searchHeader = useSearchHeader();
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const agGrid = useAgGrid<BULLETIN_REVIEW_FILTERS, BulletinReviewModel>([], gridState);
  const [ entityOptions, setEntityOptions ] = useState([]);
  const _bulletinStore = props.bulletinStore as BulletinStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;

  useEffect(() => {
    if (props.defaultSidebarOptions) _sidebarStore.setNavLinks(props.defaultSidebarOptions(true), props.basePath);
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const getFilterPropertyName = (selectedOption): any => {
    switch (selectedOption) {
      case BULLETIN_REVIEW_FILTERS.LEVEL:
        return 'bulletinLevelName';
      case BULLETIN_REVIEW_FILTERS.ENTITY:
        return 'bulletinEntityName';
      case BULLETIN_REVIEW_FILTERS.STATUS:
        return 'mergeStatusId';
    }
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const { selectInputsValues, searchValue, chipValue } = searchHeader.getFilters();
    const searchChips = (chipValue as ISelectOption[]).map(x => {
      return Utilities.isEqual(selectInputsValues.get('defaultOption'), BULLETIN_REVIEW_FILTERS.STATUS)
        ? x.value
        : x.label;
    });
    if (!searchChips.length && !searchValue.length) {
      return {};
    }
    return {
      filterCollection: JSON.stringify([
        {
          [getFilterPropertyName(selectInputsValues.get('defaultOption'))]: searchChips[0] || searchValue,
        },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
    };
    UIStore.setPageLoader(true);
    _bulletinStore
      .getBulletinReviews(props.isAirport, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(tableData => {
        const transformedData = getGridData(tableData.results, [ 1 ], false);
        gridState.setGridData(transformedData);
        gridState.setPagination(new GridPagination({ ...tableData }));
      });
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    switch (searchHeader.searchType) {
      case BULLETIN_REVIEW_FILTERS.STATUS:
        setEntityOptions(mergeStatusOptions);
        break;
      case BULLETIN_REVIEW_FILTERS.LEVEL:
        UIStore.setPageLoader(true);
        _bulletinStore
          .getBulletinLevels()
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => setEntityOptions(response));
        break;
      default:
        setEntityOptions([]);
        break;
    }
  };

  const dialogContent = data => {
    const { newValue, oldValue } = data.appliedBulletinTypes;
    return (
      <Grid container>
        {/* Applied Bulletin Types */}
        {data?.appliedBulletinTypes && (oldValue?.length > 0 || newValue?.length > 0) && (
          <Grid item xs={12}>
            <StagingFieldsRenderer
              oldValue={oldValue}
              newValue={newValue}
              title={'Bulletin Type'}
              formatFn={item => {
                if (!item.bulletinType) {
                  return '';
                }
                return item.bulletinType.name || '';
              }}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  const customErrorMessage = (error, id) => {
    if (error.message.toLowerCase().includes(`UplinkProperty ${id} Id not found`.toLowerCase())) {
      AlertStore.critical('Updates have been made to this record. Please refresh the page.');
      return;
    }
    AlertStore.critical(error.message);
  };

  const getDetailedData = data => {
    UIStore.setPageLoader(true);
    _bulletinStore
      ?.getBulletinStagingProperties(data.uplinkBulletinStagingId, props.isAirport)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          ModalStore.open(
            <Dialog
              title={'Approval Details'}
              open={true}
              onClose={() => ModalStore.close()}
              dialogContent={() => dialogContent(response)}
              disableBackdropClick={true}
            />
          );
        },
        error: error => {
          const id = Array.isArray(data) ? data[0]?.uplinkStagingPropertyId : data?.uplinkStagingPropertyId;
          if (id) {
            customErrorMessage(error, id);
          }
        },
      });
  };

  const ConfirmAction = (data, isApprove: boolean): void => {
    _useConfirmDialog.confirmAction(
      () => {
        approveRejectRecord(data, isApprove), ModalStore.close();
      },
      {
        title: 'Confirm Action',
        message: `Are you sure you want to ${isApprove ? 'approve' : 'reject'} the changes?`,
      }
    );
  };

  const approveRejectRecord = (data, isApprove: boolean): void => {
    UIStore.setPageLoader(true);
    const operationObservable = isApprove
      ? _bulletinStore.approveBulletinStaging(data?.id, props.isAirport)
      : _bulletinStore.rejectBulletinStaging(data?.id, props.isAirport);

    operationObservable
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response.hasErrors) {
            return;
          }
          loadInitialData();
        },
        error: error => {
          const id = Array.isArray(data) ? data[0]?.id : data?.id;
          if (id) {
            customErrorMessage(error, id);
          }
        },
      });
  };

  const disableActions = data => {
    if (gridState.isRowEditing || isDataMerged(data.mergeStatus) || isDataRejected(data.mergeStatus)) {
      return true;
    }
    if (
      (Utilities.isEqual(data.comparisionType, BULLETIN_COMPARISON_TYPE.ADDED) && data.id) ||
      Utilities.isEqual(data.comparisionType, BULLETIN_COMPARISON_TYPE.MODIFIED)
    ) {
      return false;
    }
    return true;
  };

  const showEditIcon = data => {
    return (
      Utilities.isEqual('BulletinCAPPSCategory.Code', data.propertyName) &&
      (Utilities.isEqual(data?.mergeStatus, BULLETIN_MERGE_STATUS.NOT_MERGED) ||
        Utilities.isEqual(data?.mergeStatus, BULLETIN_MERGE_STATUS.FAILED))
    );
  };

  const reviewActions = (rowIndex: number, { data }: RowNode) => {
    return (
      <UplinkReviewActions
        isRowEditing={gridState.isRowEditing}
        showEditIcon={props.securityModule.isEditable && showEditIcon(data)}
        onEdit={() => agGrid._startEditingCell(rowIndex, 'newValue')}
        approveRejectPermission={props.securityModule.isEditable && data.id}
        viewDetailsPermission={props.securityModule.isEditable && data.isList}
        disabledApproveReject={disableActions(data)}
        onApprove={() => ConfirmAction(data, true)}
        onReject={() => ConfirmAction(data, false)}
        onViewDetails={() => getDetailedData(data)}
      />
    );
  };

  const updateCappsCategory = rowIndex => {
    gridState.gridApi.stopEditing();
    const rowData = agGrid._getTableItem(rowIndex);
    const request = {
      bulletinStagingPropertyId: rowData?.uplinkBulletinStagingId,
      bulletinCappsCategoryCodeId: rowData?.newValue?.id,
    };
    UIStore.setPageLoader(true);
    _bulletinStore
      .updateCappsCategory(request, props.isAirport)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => loadInitialData(),
        error: error => AlertStore.critical(error.message),
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Bulletin Level',
      field: 'bulletinLevel',
      minWidth: 150,
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Bulletin Level',
      editable: false,
    },
    {
      headerName: 'Property Name',
      field: 'propertyName',
      minWidth: 150,
      headerTooltip: 'Property Name',
      editable: false,
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
      minWidth: 150,
      headerTooltip: 'Old Value',
      editable: false,
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      minWidth: 150,
      headerTooltip: 'New Value',
      valueFormatter: ({ value }) => (typeof value === 'object' ? value?.code : value),
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => _bulletinStore.cappsCategory,
        isLoading: () => UIStore.pageLoading,
        autoCompleteFormatValue: (value, { data }) => {
          if (!data) {
            return '';
          }
          return new IdNameCodeModel({
            id: data.newValueId,
            name: data.newValue,
            code: data.newValueCode,
          });
        },
      },
    },
    {
      headerName: 'Comparison Type',
      field: 'comparisonType',
      minWidth: 120,
      headerTooltip: 'Comparison Type',
      valueFormatter: ({ data }) => comparisonType[data?.comparisionType] || '',
      editable: false,
      sortable: false,
    },
    {
      headerName: 'Status',
      field: 'mergeStatus',
      minWidth: 120,
      editable: false,
      headerTooltip: 'Status',
      cellRenderer: 'statusRenderer',
      cellRendererParams: ({ data }) => {
        return {
          value: mergeStatus[data?.mergeStatus],
        };
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRenderer: 'viewRenderer',
        maxWidth: 180,
        minWidth: 180,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
      },
      columnDefs,
      isEditable: props.securityModule.isEditable,
      gridActionProps: {
        getViewRenderer: reviewActions,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (rowIndex === null) {
            return;
          }
          if (action === GRID_ACTIONS.SAVE) {
            updateCappsCategory(rowIndex);
            return;
          }
          gridState.gridApi.stopEditing(true);
        },
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      pagination: false,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      suppressClickEdit: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onRowEditingStarted: params => {
        gridState.setHasError(true);
        _bulletinStore.loadCappsCategory().subscribe();
      },
      onRowEditingStopped: params => {
        gridState.gridApi.refreshCells({ rowNodes: [ params.node ], force: true });
        gridState.setIsRowEditing(false);
      },

      groupDefaultExpanded: 0, // Expand all groups by default
      getDataPath: data => data.path,
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Bulletin Entity',
        field: 'bulletinEntityName',
        minWidth: 180,
        editable: false,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(BULLETIN_REVIEW_FILTERS, BULLETIN_REVIEW_FILTERS.ENTITY) ]}
        isChipInputControl={!Utilities.isEqual(searchHeader.searchType, BULLETIN_REVIEW_FILTERS.ENTITY)}
        chipInputProps={{
          options: entityOptions,
          allowOnlySingleSelect: true,
          onFocus: loadEntityOptions,
        }}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        classes={{ customHeight: classes.customHeight }}
      />
    </>
  );
};

export default inject('bulletinStore', 'sidebarStore')(observer(BulletinsReview));

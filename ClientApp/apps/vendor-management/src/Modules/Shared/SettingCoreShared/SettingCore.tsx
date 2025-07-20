import React, { FC, useEffect, useRef, ReactNode } from 'react';
import { CustomAgGridReact, useGridFilters, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { StatusBaseModel, PARAMETERS_SETTINGS_COMPARISON_FILTERS, SETTING_ID } from '../../Shared';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  UIStore,
  Utilities,
  SearchStore,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { SettingsStore } from '../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router-dom';
import { gridFilters } from '../../VendorSettings/Fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { observer } from 'mobx-react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import './setting-core.css';
import { ConfirmDialog, ConfirmNavigate } from '@wings-shared/layout';
import { Typography } from '@material-ui/core';

interface Props {
  settingsStore?: SettingsStore;
  columnDefs: ColDef[];
  settingId: SETTING_ID;
  collectionName: string;
  isAuditColumnEnabled: boolean;
  actionColumn: ColDef;
  isActionEnabled: boolean;
  rightContentAction: boolean;
  rightContentActionText: string;
  onSave: (rowIndex: number, agGrid: any, gridState: any) => void;
  selectInputFilter: boolean;
  isEditable: boolean;
  selectInputs: any;
  showCollapseExpand: boolean;
  addressTypeEdit?: boolean;
}

const SettingCore: FC<Props> = ({
  settingsStore,
  columnDefs,
  settingId,
  collectionName,
  isAuditColumnEnabled,
  isActionEnabled,
  rightContentAction,
  rightContentActionText,
  onSave,
  selectInputFilter,
  isEditable,
  selectInputs,
  showCollapseExpand,
  addressTypeEdit
}) => {
  //   const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<PARAMETERS_SETTINGS_COMPARISON_FILTERS, StatusBaseModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const location = useLocation();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const filtersApi = useGridFilters<PARAMETERS_SETTINGS_COMPARISON_FILTERS>(gridFilters, gridState);

  // Load Data on Mount
  useEffect(() => {
    // Restore Search Result based on available history
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    gridState.setIsProcessing(true);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...searchCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    settingId == SETTING_ID.SETTINGS_SERVICE_ITEM_NAME ? settingsStore?.searchServiceCategory('') : '';
    settingsStore
      ?.getSettings(settingId, collectionName,request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: IAPIPageResponse<StatusBaseModel>) => {
        gridState.setPagination(new GridPagination({ ...response }));
        const results = StatusBaseModel.deserializeList(response.results);
        gridState.setGridData(results);
        const allowSelectAll = response.totalNumberOfRecords <= response.pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const onInputChange = (): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  // Save row editing
  const saveRowData = (rowIndex: number) => {
    gridState.gridApi.stopEditing();
    onSave(rowIndex, agGrid, gridState);
    gridState.setIsAllRowsSelected(false);
  };

  const addNewType = () => {
    agGrid.addNewItems([{ id: 0, name: '' }], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const gridOptions = (): GridOptions => {
    const newColumnDefs = [ ...columnDefs.slice(0, columnDefs.length - 1) ];
    if (isAuditColumnEnabled) newColumnDefs.push(...agGrid.auditFields(gridState.isRowEditing));
    newColumnDefs.push(...columnDefs.slice(columnDefs.length - 1));

    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs: newColumnDefs,
      isEditable: isEditable,
      gridActionProps: {
        isActionMenu: false,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const model= agGrid._getTableItem(rowIndex)
              if (addressTypeEdit === false && model.id === 1) {
                alertEdit();
              } else agGrid._startEditingCell(rowIndex, 'name');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      // deltaRowDataMode: true,
      suppressScrollOnNewData: true,
      getRowNodeId: function (data) {
        return data.id;
      },
      suppressClickEdit: addressTypeEdit === false ? true: false,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  const alertEdit = (): void => {
    ModalStore.open(
      <Dialog
        title={'Alert'}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => <Typography>HQ Physical Address can't be edited</Typography>}
        closeBtn={true}
        dialogActions={() => dialogContent()}
      />
    );
  };

  const dialogContent = () => {
    return (
      <PrimaryButton variant="contained" color="primary" onClick={() => ModalStore.close()}>
        Cancel
      </PrimaryButton>
    );
  };

  const rightContent = (): ReactNode => {
    return (
      <>
        {rightContentAction ? (
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => addNewType()}
            disabled={gridState.isRowEditing || gridState.isProcessing}
          >
            {rightContentActionText}
          </PrimaryButton>
        ) : (
          ''
        )}
      </>
    );
  };

  const getConfirmation = (rowIndex: number): void => {
    if (gridState.isAllRowsSelected) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Changes"
          message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
          yesButton="Confirm"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => {
            ModalStore.close();
            cancelEditing(rowIndex);
            removeUnSavedRow(rowIndex);
          }}
        />
      );
    } else {
      cancelEditing(rowIndex);
      removeUnSavedRow(rowIndex);
    }
  };

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
  };

  const removeUnSavedRow = (rowIndex: number) => {
    const data: ServiceItemPricingModel = agGrid._getTableItem(rowIndex);
    if (!data.id) {
      const model = agGrid._getTableItem(rowIndex);
      agGrid._removeTableItems([ model ]);
    }
  };

  // All | Removed | Added | Filters | Airport | Runways
  const searchCollection = (): IAPIGridRequest | null => {
    const searchHeader = searchHeaderRef.current;
    const chip = searchHeader?.getFilters().chipValue?.valueOf();
    if (!searchHeader) {
      return null;
    }
    const propertyValue = searchHeader.searchValue ? searchHeader.searchValue : chip?.length > 0 ? chip[0]?.label : '';
    if (propertyValue === '') {
      return null;
    }
    const filters = [
      {
        name: propertyValue,
      },
    ];
    return {
      filterCollection: JSON.stringify(filters),
    };
  };

  return (
    <>
      <ConfirmNavigate isBlocker={gridState.isRowEditing}>
        <SearchHeaderV2
          placeHolder="Start typing to search"
          ref={searchHeaderRef}
          onExpandCollapse={showCollapseExpand ? agGrid.autoSizeColumns : ''}
          selectInputs={[]}
          onFilterChange={isInitEvent => {
            loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
            agGrid.cancelEditing(0);
          }}
          rightContent={rightContent}
        />
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={gridState.data}
          gridOptions={gridOptions()}
          serverPagination={true}
          paginationData={gridState.pagination}
          onPaginationChange={loadInitialData}
          disablePagination={gridState.isRowEditing || gridState.isProcessing}
        />
      </ConfirmNavigate>
    </>
  );
};
export default observer(SettingCore);

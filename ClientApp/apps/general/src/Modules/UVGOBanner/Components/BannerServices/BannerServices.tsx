import React, { FC, ReactNode, RefObject, useEffect, useMemo, useRef } from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { GridOptions, ColDef, RowNode, RowEditingStartedEvent, ICellEditorParams } from 'ag-grid-community';
import { styles } from './BannerServices.styles';
import { Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import { UVGOBannerServicesModel } from '../../../Shared/Models/UVGOBannerServices.model';
import { BANNER_TYPE_SERVICE_FILTERS, UVGOBannerStore } from '../../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { UIStore, Utilities, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  IActionMenuItem,
  CustomAgGridReact,
  AgGridActions,
  AgGridAutoComplete,
  useGridState,
  useAgGrid,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';

interface Props {
  uvgoBannerStore?: UVGOBannerStore;
}

const BannerServices: FC<Props> = ({ ...props }: Props) => {
  const alertMessageId: string = 'BannerAlertMessage';
  const gridState = useGridState();
  const agGrid = useAgGrid<'', UVGOBannerServicesModel>([], gridState);
  const classes: Record<string, string> = styles();
  const _uvgoBannerStore = props.uvgoBannerStore as UVGOBannerStore;
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const unsubscribe = useUnsubscribe();


  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _uvgoBannerStore
      ?.uvgoBannerServices()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: UVGOBannerServicesModel[]) => {
        gridState.setGridData(data);
        agGrid.reloadColumnState();
      });
  }

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  /* istanbul ignore next */
  const actionMenus = (uvgoBannerServices: UVGOBannerServicesModel): IActionMenuItem[] => {
    return [
      { title: 'Edit', isDisabled: !hasAnyPermission, action: GRID_ACTIONS.EDIT },
      { title: 'Delete', isDisabled: !hasAnyPermission, action: GRID_ACTIONS.DELETE },
    ];
  }
  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,500',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => actionMenus(node.data),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  const gridActionProps = (): object => {
    return {
      tooltip: 'uvGOBannerServices',
      getDisabledState: () => gridState.hasError,
      onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
    };
  }

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  }

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs: columnDefs,
      isEditable: true,
      gridActionProps: gridActionProps(),
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
      },
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const { id, name } = node.data as UVGOBannerServicesModel;
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass({
            [ BANNER_TYPE_SERVICE_FILTERS.NAME ]: name,
          },
          searchHeader.searchValue,
          searchHeader.selectedOption))
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
      },
    };
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertBannerServices(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveBannerServices(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.cancelEditing(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        break;
    }
  }

  // Check if channel already exists
  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Banner Services Name should be unique.', alertMessageId);
      return true;
    }

    return false;
  }

  /* istanbul ignore next */
  const upsertBannerServices = (rowIndex: number): void => {
    const data: UVGOBannerServicesModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const hasInvalidRowData: boolean = Utilities.hasInvalidRowData(gridState.gridApi);
    if (hasInvalidRowData) {
      AlertStore.info('Please fill all required fields');
      return;
    }
    UIStore.setPageLoader(true);
    _uvgoBannerStore
      ?.upsertUVGOBannerServices(data)
      .pipe(
        switchMap(() => (_uvgoBannerStore as UVGOBannerStore).uvgoBannerServices()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: UVGOBannerServicesModel[]) => (gridState.setGridData(response)),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  const removeBannerServices = (rowIndex: number): void => {
    ModalStore.close();
    const uvgoBannerServices: UVGOBannerServicesModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _uvgoBannerStore
      ?.deleteUVGOBannerServices(uvgoBannerServices.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            agGrid._removeTableItems([ uvgoBannerServices ]);
            gridState.setGridData(agGrid._getAllTableRows());
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  const rightContent = (): ReactNode => {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={!hasAnyPermission || gridState.isProcessing}
        onClick={() => addBannerServices()}
      >
        Add Banner Services
      </PrimaryButton>
    );
  }

  const addBannerServices=(): void =>{
    agGrid.addNewItems([ new UVGOBannerServicesModel({ id: 0 }) ], { startEditing: true, colKey: 'name' });
    gridState.setHasError(true);
  }

  const confirmRemoveBannerServices = (rowIndex: number): void => {
    const model: UVGOBannerServicesModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      agGrid._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Banner Services?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => removeBannerServices(rowIndex)}
      />
    );
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <SpeakerNotesIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Banner Services
          </Typography>
        </div>
        <div>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[
              agGridUtilities.createSelectOption(BANNER_TYPE_SERVICE_FILTERS, BANNER_TYPE_SERVICE_FILTERS.NAME),
            ]}
            onFilterChange={() => gridState.gridApi.onFilterChanged()}
            onClear={() => {
              loadInitialData()
            }}
            onSearch={() => {
              loadInitialData()
            }}

            disableControls={Boolean(Array.from(gridState.columFilters).length)}
          />
        </div>
        <div>{rightContent()}</div>
      </div>
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
}

export default inject('uvgoBannerStore')(observer(BannerServices));

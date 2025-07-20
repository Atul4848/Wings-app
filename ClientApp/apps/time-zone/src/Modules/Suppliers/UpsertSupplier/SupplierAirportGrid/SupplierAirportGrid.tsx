import React, { FC, useEffect, useMemo } from 'react';
import {
  ICellRendererParams,
  GridOptions,
  ColDef,
  ICellEditorParams,
  ValueFormatterParams,
  ICellEditor,
} from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, GRID_ACTIONS, EntityMapModel, tapWithAction } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { useGeographicModuleSecurity } from '../../../Shared/Tools';
import { BaseAirportStore, IUseUpsert, ModelStatusOptions } from '@wings/shared';
import { useStyles } from './SupplierAirportGrid.styles';
import { airportRequest } from '../Fields';
import { SupplierAirportModel, TimeZoneStore } from '../../../Shared';
import { useParams } from 'react-router-dom';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props extends Partial<ICellRendererParams> {
  isEditable?: boolean;
  supplierAirports?: SupplierAirportModel[];
  onRowEditing?: (isEditing: boolean) => void;
  useUpsert: IUseUpsert;
  timeZoneStore?: TimeZoneStore;
}

const SupplierAirportGrid: FC<Props> = ({
  isEditable,
  onRowEditing,
  supplierAirports,
  useUpsert,
  timeZoneStore,
}: Props) => {
  const unsubscribe = useUnsubscribe();
  const alertMessageId: string = 'Suuplier Airport';
  const params = useParams();
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', SupplierAirportModel>([], gridState);
  const geographicModuleSecurity = useGeographicModuleSecurity();
  const baseAirportStore = useMemo(() => new BaseAirportStore(), []);
  const _timeZoneStore = timeZoneStore as TimeZoneStore;

  useEffect(() => {
    loadInitialData();
  }, [ supplierAirports ]);

  const loadInitialData = () => {
    gridState.setGridData(supplierAirports || []);
  };

  const isAlreadyExists = (data: SupplierAirportModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'airport' ],
    });
    const airport = editorInstance[0]?.getValue();
    const isDuplicateData = gridState.data.some(a => a.airport.entityId === airport.entityId && data?.id !== a.id);

    if (isDuplicateData) {
      agGrid.showAlert(`Airport already exists with :${airport.name}`, alertMessageId);
      return true;
    }
    return false;
  };

  const addAirport = (): void => {
    const airportModel = new SupplierAirportModel({ id: 0 });
    const colKey: string = 'airport';
    agGrid.addNewItems([ airportModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  const searchAirports = (searchValue: string): void => {
    if (!Boolean(searchValue)) {
      baseAirportStore.wingsAirports = [];
      return;
    }
    useUpsert.observeSearch(
      baseAirportStore.getWingsAirports(airportRequest(searchValue)).pipe(
        tapWithAction(response => {
          baseAirportStore.wingsAirports = response.results.map(x => {
            return new EntityMapModel({
              entityId: x.airportId,
              name: x.name,
              code: x.displayCode,
            });
          });
        })
      )
    );
  };

  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const saveChanges = (rowIndex): void => {
    const data: SupplierAirportModel = agGrid._getTableItem(rowIndex);
    data.supplierId = Number(params.supplierId) || 0;
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _timeZoneStore
      .upsertSupplierAirport(data.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: SupplierAirportModel) => {
          const isNewResponse: boolean = data.id === 0;
          const updatedData = Utilities.updateArray<SupplierAirportModel>(gridState.data, response, {
            replace: !isNewResponse,
            predicate: t => t.id === response.id,
          });
          gridState.setGridData(updatedData || []);
        },
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
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
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        saveChanges(rowIndex);
        onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport',
      field: 'airport',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Airport',
        getAutoCompleteOptions: () => baseAirportStore.wingsAirports,
        onSearch: value => searchAirports(value),
        valueGetter: (option: EntityMapModel) => {
          return option;
        },
      },
    },
    {
      headerName: 'Capps Supplier Airport Id',
      field: 'cappsSupplierAirportId',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: 'string|between:1,10',
      },
    },
    {
      headerName: 'Toll Free Number',
      field: 'tollFreeNumber',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: 'string|between:1,50',
      },
    },
    {
      headerName: 'Phone Number',
      field: 'phoneNumber',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: 'string|between:1,50',
      },
    },
    {
      headerName: 'Fax Number',
      field: 'faxNumber',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: 'string|between:1,50',
      },
    },
    {
      headerName: 'Web Site',
      field: 'webSite',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: 'string|between:1,100',
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: option => option,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
        },
      }),
    },
  ];

  const onDropDownChange = (params: ICellEditorParams, value: any): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressClickEdit: true,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        onRowEditing(true);
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };

  return (
    <div className={classes.gridRoot}>
      <AgGridMasterDetails
        addButtonTitle="Add Supplier Airport"
        onAddButtonClick={() => addAirport()}
        hasAddPermission={geographicModuleSecurity.isEditable}
        disabled={
          !Number(params.supplierId) ||
          gridState.hasError ||
          gridState.isRowEditing ||
          UIStore.pageLoading ||
          !isEditable
        }
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} isRowEditing={gridState.isRowEditing} />
      </AgGridMasterDetails>
    </div>
  );
};

export default inject('timeZoneStore')(observer(SupplierAirportGrid));

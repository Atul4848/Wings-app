import React, { FC, useEffect, useMemo } from 'react';
import { ICellRendererParams, GridOptions, ColDef, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, GRID_ACTIONS, EntityMapModel, regex, tapWithAction } from '@wings-shared/core';
import { observer } from 'mobx-react';
import { useGeographicModuleSecurity } from '../../../Shared/Tools';
import { BaseAirportStore, IUseUpsert } from '@wings/shared';
import { useStyles } from './AirportGrid.styles';
import { HotelAirportModel } from '../../../Shared';
import { airportRequest } from '../Fields';

interface Props extends Partial<ICellRendererParams> {
  isEditable?: boolean;
  onDataSave: (response: HotelAirportModel[]) => void;
  airports: HotelAirportModel[];
  onRowEditing: (isEditing: boolean) => void;
  useUpsert: IUseUpsert;
}

const AirportGrid: FC<Props> = ({ isEditable, onRowEditing, onDataSave, airports, useUpsert }: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', HotelAirportModel>([], gridState);
  const geographicModuleSecurity = useGeographicModuleSecurity();
  const baseAirportStore = useMemo(() => new BaseAirportStore(), []);

  useEffect(() => {
    loadInitialData();
  }, [ airports ]);

  const loadInitialData = () => {
    gridState.setGridData(airports || []);
  };

  const addAirport = (): void => {
    const airportModel = new HotelAirportModel({ id: 0 });
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
  const isAlreadyExists = (id: number): boolean => {
    const editorInstance = gridState.gridApi.getCellEditorInstances({ columns: [ 'airport' ] });
    const value = editorInstance[0].getValue();
    const isDuplicateData = gridState.data?.some(a =>
      id ? a.airport.entityId === value.entityId && id !== a.id : a.airport.entityId === value.entityId
    );
    if (isDuplicateData) {
      agGrid.showAlert('Airport should be unique.', 'AirportService');
      return true;
    }
    return false;
  };

  const updateTableData = (rowIndex): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    onDataSave(gridState.data);
  };

  const upsertAirport = (rowIndex: number): void => {
    updateTableData(rowIndex);
  };

  const deleteAirport = (model: HotelAirportModel): void => {
    agGrid._removeTableItems([ model ]);
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    onDataSave(data);
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
        upsertAirport(rowIndex);
        onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        const model = agGrid._getTableItem(rowIndex);
        agGrid.cancelEditing(rowIndex);
        if (model.id === 0) {
          deleteAirport(model);
          return;
        }
        onRowEditing(false);
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
      headerName: 'Distance from Airport',
      field: 'distance',
      cellEditorParams: {
        rules: `numeric|between:0.0,999.9|regex:${regex.numberWithTwoDecimal}`,
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
        addButtonTitle="Add Airport"
        onAddButtonClick={() => addAirport()}
        hasAddPermission={geographicModuleSecurity.isEditable}
        disabled={!isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading}
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} isRowEditing={gridState.isRowEditing} />
      </AgGridMasterDetails>
    </div>
  );
};

export default observer(AirportGrid);

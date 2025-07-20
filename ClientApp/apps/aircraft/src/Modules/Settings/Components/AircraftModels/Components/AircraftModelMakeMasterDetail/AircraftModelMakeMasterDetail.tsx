import React, { FC } from 'react';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { Utilities, ENTITY_STATE, SettingsTypeModel, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import {
  ColDef,
  GridOptions,
  RowEditingStartedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { observer } from 'mobx-react';
import { SettingsStore, AircraftModelMakeModel, useAircraftModuleSecurity } from '../../../../../Shared';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { useStyles } from './AircraftModelMakeMasterDetail.styles';

interface Props {
  modelMakes: AircraftModelMakeModel[];
  settingsStore?: SettingsStore;
  onDataSave: (response: AircraftModelMakeModel[]) => void;
  onRowEditing: (isEditing: boolean) => void;
}

const AircraftModelMakeMasterDetail: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<'', AircraftModelMakeModel>([], gridState);
  const classes = useStyles();
  const _settingsStore = props.settingsStore as SettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAircraftModelMake(rowIndex);
        props.onRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        deleteRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        canceEditing(rowIndex);
        props.onRowEditing(false);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        props.onRowEditing(false);
        break;
    }
  };

  /* istanbul ignore next */
  const upsertAircraftModelMake = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const deleteRecord = (rowIndex: number): void => {
    const model: AircraftModelMakeModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  /* istanbul ignore next */
  const canceEditing = (rowIndex: number): void => {
    const data: AircraftModelMakeModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  /* istanbul ignore next */
  const makeOptions = (): SettingsTypeModel[] => {
    return _settingsStore.makes.filter(make => !gridState.data.some(x => x.make?.id === make.id));
  };

  const updateTableData = (): void => {
    const _data = agGrid._getAllTableRows().map(
      requirement =>
        new AircraftModelMakeModel({
          ...requirement,
          entityState: ENTITY_STATE.NEW,
        })
    );
    gridState.setGridData(_data);
    props.onDataSave(gridState.data);
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Make',
      field: 'make',
      cellEditor: 'customAutoComplete',
      comparator: (current: AircraftModelMakeModel, next: AircraftModelMakeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Make',
        getAutoCompleteOptions: () => makeOptions(),
      },
    },
    {
      headerName: 'Large Aircraft',
      field: 'isLargeAircraft',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isSettingsEditable,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });
    return {
      ...baseOptions,
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        gridState.setHasError(true);
        agGrid.startEditingRow(event);
        props.onRowEditing(true);
      },
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
      },
    };
  };

  const addNewRecord = (): void => {
    const make = new AircraftModelMakeModel({ id: 0 });
    agGrid.addNewItems([ make ], { startEditing: false, colKey: 'make' });
    gridState.setHasError(true);
  };

  return (
    <div className={classes?.root}>
      <CollapsibleWithButton
        title="Make"
        buttonText="Add Make"
        isButtonDisabled={gridState.isRowEditing || UIStore.pageLoading || !aircraftModuleSecurity.isSettingsEditable}
        onButtonClick={addNewRecord}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={props.modelMakes}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default observer(AircraftModelMakeMasterDetail);

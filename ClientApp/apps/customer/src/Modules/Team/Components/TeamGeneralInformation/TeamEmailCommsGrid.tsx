import React, { FC, ReactNode, useEffect } from 'react';
import { ICellRendererParams, GridOptions, ColDef, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, GRID_ACTIONS, SettingsTypeModel, ISelectOption, ENTITY_STATE } from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import { IUseUpsert, ModelStatusOptions } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useConfirmDialog } from '@wings-shared/hooks';
import { SettingsStore, TeamEmailCommsModel, useCustomerModuleSecurity } from '../../../Shared';
import { useStyles } from './TeamGeneralInformation.style';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import Chip from '@material-ui/core/Chip';

interface Props extends Partial<ICellRendererParams> {
  isEditable?: boolean;
  onDataSave: (response: TeamEmailCommsModel[]) => void;
  teamEmailComms: TeamEmailCommsModel[];
  settingsStore?: SettingsStore;
  onRowEditing: (isEditing: boolean) => void;
}

const TeamEmailCommsGrid: FC<Props> = ({
  isEditable,
  onDataSave,
  teamEmailComms,
  settingsStore,
  onRowEditing,
}: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<'', TeamEmailCommsModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const customerModuleSecurity = useCustomerModuleSecurity();
  const _settingsStore = settingsStore as SettingsStore;
  const classes = useStyles();

  useEffect(() => {
    loadInitialData();
  }, [ teamEmailComms ]);

  const loadInitialData = () => {
    gridState.setGridData(teamEmailComms);
  };

  const addTeamEmailComms = (): void => {
    const teamEmailCommsModel = new TeamEmailCommsModel({ id: 0, teamUseType: [] });
    const colKey: string = 'contact';
    agGrid.addNewItems([ teamEmailCommsModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const updateTableData = (): void => {
    gridState.gridApi.stopEditing();
    const _data = agGrid._getAllTableRows().map(
      team =>
        new TeamEmailCommsModel({
          ...team,
          entityState: ENTITY_STATE.NEW,
        })
    );
    gridState.setGridData(_data);
    onDataSave(_data);
  };

  const upsertTeamEmailComms = (rowIndex): void => {
    updateTableData();
  };

  const deleteTeamEmailComms = (model: TeamEmailCommsModel): void => {
    agGrid._removeTableItems([ model ]);
    updateTableData();
    ModalStore.close();
  };

  const confirmRemoveTeamEmailCommsModel = (rowIndex: number): void => {
    const model: TeamEmailCommsModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteTeamEmailComms(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteTeamEmailComms(model), { isDelete: true });
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: TeamEmailCommsModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
    onRowEditing(false);
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
        upsertTeamEmailComms(rowIndex);
        onRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveTeamEmailCommsModel(rowIndex);
        onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const viewRenderer = (chips: SettingsTypeModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips.length;
    const limitTags = 3;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((useType: SettingsTypeModel, index) => (
          <Chip
            key={useType.id}
            label={useType.label}
            {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
          />
        ))}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact',
      field: 'contact',
      cellEditorParams: {
        rules: 'required|string|email|between:0,50',
      },
    },
    {
      headerName: 'Team Use Type',
      field: 'teamUseType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellRenderer: 'agGridChipView',
      cellEditorParams: {
        isRequired: true,
        multiSelect: true,
        placeHolder: 'Select Team Use Type',
        getAutoCompleteOptions: () => _settingsStore.teamUseType,
        valueGetter: (option: SettingsTypeModel) => option,
        renderTags: viewRenderer,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
        valueGetter: (option: ISelectOption) => option,
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
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        onRowEditing(true);
        _settingsStore.getTeamUseType().subscribe();
        _settingsStore.getAccessLevels().subscribe();
      },
      onRowEditingStopped: params => {
        agGrid.onRowEditingStopped();
        onRowEditing(false);
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };

  return (
    <div className={classes.gridRoot}>
      <AgGridMasterDetails
        addButtonTitle="Add Email Comms"
        onAddButtonClick={addTeamEmailComms}
        hasAddPermission={customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser}
        disabled={!isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading}
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} isRowEditing={gridState.isRowEditing} />
      </AgGridMasterDetails>
    </div>
  );
};

export default inject('settingsStore')(observer(TeamEmailCommsGrid));

import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { 
  SettingsStore, 
  TYPE_DESIGNATOR_FILTERS, 
  TypeDesignatorModel, 
  useAircraftModuleSecurity 
} from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, SettingsTypeModel, regex } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { forkJoin } from 'rxjs';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  settingsStore?: SettingsStore;
}

const TypeDesignator: FC<Props> = ({ settingsStore }) => {
  const alertMessageId: string = 'TypeDesignator';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<TYPE_DESIGNATOR_FILTERS, TypeDesignatorModel>([], gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();
  const _useConfirmDialog = useConfirmDialog();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getICAOTypeDesignators(), _settingsStore.getPropulsionType() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ typeDesinator ]) => gridState.setGridData(typeDesinator));
  };

  const addNewType = () => {
    agGrid.addNewItems(
      [
        new TypeDesignatorModel({
          id: 0,
          name: '',
          propulsionType: new SettingsTypeModel(),
        }),
      ],
      {
        startEditing: false,
        colKey: 'name',
      }
    );
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const removeTypeDesignator = (rowIndex: number) => {
    ModalStore.close();
    const model: TypeDesignatorModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _settingsStore.removeICAOTypeDesignator(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(gridState.data.filter(({ id }) => model.id !== id));
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };
  
  const confirmRemoveTypeDesignator = (rowIndex: number) => {
    const model: TypeDesignatorModel = agGrid._getTableItem(rowIndex);
    if (!Boolean(model.id)) {
      agGrid._removeTableItems([ model ]);
      return;
    }
    _useConfirmDialog.confirmAction(() => removeTypeDesignator(rowIndex), 
      {
        title: 'Delete ICAO Type Designator',
        message: 'Are you sure you want to delete this ICAO Type Designator?',
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
        upsertTypeDesignator(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveTypeDesignator(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const upsertTypeDesignator = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertICAOTypeDesignator(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: TypeDesignatorModel) => agGrid._sortColumns(rowIndex, response, 'name'),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'ICAO Type Designator',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        rules: `required|string|between:1,4|regex:${regex.alphaNumeric}`,
      },
    },
    {
      headerName: 'Propulsion Type',
      field: 'propulsionType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Propulsion Type',
        getAutoCompleteOptions: () => _settingsStore.propulsionType,
      },
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
      isEditable: aircraftModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, propulsionType } = node.data as TypeDesignatorModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [TYPE_DESIGNATOR_FILTERS.NAME]: name,
              [TYPE_DESIGNATOR_FILTERS.PROPULSION_TYPE]: propulsionType.name,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!aircraftModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add ICAO Type Designator
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(TYPE_DESIGNATOR_FILTERS, TYPE_DESIGNATOR_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('settingsStore')(observer(TypeDesignator));

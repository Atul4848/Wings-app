import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import {
  GRID_ACTIONS,
  SettingsTypeModel,
  UIStore,
  Utilities,
  cellStyle,
} from '@wings-shared/core';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Logger } from '@wings-shared/security';
import { CountryModel } from '@wings/shared';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  SettingsStore,
  TRAVELED_HISTORY_SUB_CATEGORY_FILTERS,
  TraveledHistorySubCategoryModel,
  useRestrictionModuleSecurity,
} from '../../../Shared';

interface Props {
  settingsStore?: SettingsStore;
}

const TraveledHistorySubCategory: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<TRAVELED_HISTORY_SUB_CATEGORY_FILTERS, TraveledHistorySubCategoryModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const alertMessageId: string = 'SubCategory';
  const _settingsStore = props.settingsStore as SettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getTraveledHistorySubCategories(), _settingsStore.getTraveledHistoryCategories() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ subCategories ]) => gridState.setGridData(subCategories));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,75',
      },
    },
    {
      headerName: 'Category',
      field: 'category',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Category',
        getAutoCompleteOptions: () => _settingsStore.traveledHistoryCategories,
        valueGetter: (option: CountryModel) => option,
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      hide: !restrictionModuleSecurity.isSettingsEditable,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
      isEditable: restrictionModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, category } = node.data as TraveledHistorySubCategoryModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [TRAVELED_HISTORY_SUB_CATEGORY_FILTERS.NAME]: name,
              [TRAVELED_HISTORY_SUB_CATEGORY_FILTERS.CATEGORY]: category.name,
            },
            searchHeader.getFilters().searchValue || '',
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const addNewType = () => {
    agGrid.addNewItems(
      [
        new TraveledHistorySubCategoryModel({
          id: 0,
          name: '',
          category: new SettingsTypeModel(),
        }),
      ],
      {
        startEditing: false,
        colKey: 'name',
      }
    );
    gridState.setHasError(true);
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', alertMessageId);
      return true;
    }
    return false;
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
        upsertSubCategory(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const rightContent = (): ReactNode => {
    if (!restrictionModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={gridState.isRowEditing} onClick={addNewType}>
        Add Travel History Sub Category
      </PrimaryButton>
    );
  };

  const upsertSubCategory = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertTraveledHistorySubCategory(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: TraveledHistorySubCategoryModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(
            TRAVELED_HISTORY_SUB_CATEGORY_FILTERS,
            TRAVELED_HISTORY_SUB_CATEGORY_FILTERS.NAME
          ),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
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

export default inject('settingsStore')(observer(TraveledHistorySubCategory));

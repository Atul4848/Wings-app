import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import {
  PASSPORT_NATIONALITY,
  PassportNationalityModel,
  SettingsStore,
  useCustomerModuleSecurity,
} from '../../../Shared';
import { ColDef, GridOptions, ICellEditor, ICellRendererParams } from 'ag-grid-community';
import { GRID_ACTIONS, IdNameCodeModel, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props extends Partial<ICellRendererParams> {
  settingsStore?: SettingsStore;
}

const PassportNationality: FC<Props> = observer(({ settingsStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<PASSPORT_NATIONALITY, PassportNationalityModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const _settingsStore = settingsStore as SettingsStore;
  const _useConfirmDialog = useConfirmDialog();
  const customerModuleSecurity = useCustomerModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getPassportNationality()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: PassportNationalityModel[]) => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const onDropDownChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: PassportNationalityModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'passportNationalityCode' ],
    });
    const nationality = editorInstance[0].getValue();

    const isDuplicateData = gridState.data.some(
      a => Utilities.isEqual(a.passportNationalityCode, nationality) && data?.id !== a.id
    );

    if (isDuplicateData) {
      AlertStore.critical(`Passport Nationality Code : ${nationality} already exists`);
    }
    return isDuplicateData;
  };

  /* istanbul ignore next */
  const upsertPassportNationality = (rowIndex: number): void => {
    const rowData: PassportNationalityModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(rowData)) {
      return;
    }
    gridState.gridApi.stopEditing();

    UIStore.setPageLoader(true);
    _settingsStore
      .upsertPassportNationality(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: PassportNationalityModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  /* istanbul ignore next */
  const deleteNationality = (rowIndex: number): void => {
    const data: PassportNationalityModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ModalStore.close();
    _settingsStore
      ?.removePassportNationality(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ data ]);
          gridState.data = agGrid._getAllTableRows();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
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
        upsertPassportNationality(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(() => deleteNationality(rowIndex), {
          isDelete: true,
          title: 'Delete Passport Nationality',
        });
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Country',
      field: 'country',
      cellEditor: 'customAutoComplete',
      comparator: (current: IdNameCodeModel, next: IdNameCodeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }) => (value?.label ? value?.label : ''),
      cellEditorParams: {
        placeHolder: 'Country',
        getAutoCompleteOptions: () => _settingsStore.countries,
        valueGetter: (option: IdNameCodeModel) => option,
      },
    },
    {
      headerName: 'Nationality Code',
      field: 'passportNationalityCode',
      cellEditorParams: {
        rules: 'required|string|min:1|max:3',
      },
    },
    {
      headerName: 'Nationality Description',
      field: 'description',
      cellEditorParams: {
        rules: 'string|between:1,100',
      },
    },
    {
      ...agGrid.actionColumn({
        hide: !customerModuleSecurity.isSettingsEditable,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: customerModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        _settingsStore?.getCountries().subscribe();
      },
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, country, passportNationalityCode } = node.data as PassportNationalityModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [PASSPORT_NATIONALITY.COUNTRY_CODE]: country?.code,
              [PASSPORT_NATIONALITY.COUNTRY_NAME]: country?.name,
              [PASSPORT_NATIONALITY.PASSPORT_NATIONALITY]: passportNationalityCode,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const addNewPassportNationality = () => {
    const passportNationality = new PassportNationalityModel({ id: 0 });
    agGrid.addNewItems([ passportNationality ], { startEditing: false, colKey: 'country' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isSettingsEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addNewPassportNationality}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        >
          Add Passport Nationality
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(PASSPORT_NATIONALITY, PASSPORT_NATIONALITY.PASSPORT_NATIONALITY),
        ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
});

export default inject('settingsStore')(PassportNationality);

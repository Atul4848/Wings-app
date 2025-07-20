import React, { FC, ReactNode, RefObject, useEffect, useRef } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AxiosError } from 'axios';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { UIStore, Utilities, IdNameCodeModel, GRID_ACTIONS, cellStyle, regex } from '@wings-shared/core';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { BulletinStore, NAME_CODE_FILTER } from '../../../Bulletins';

interface Props {
  bulletinStore?: BulletinStore;
  isSettingsEditable?: boolean;
}

const CappsCategory: FC<Props> = ({ bulletinStore, isSettingsEditable }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const gridState = useGridState();
  const agGrid = useAgGrid<NAME_CODE_FILTER, IdNameCodeModel>([], gridState);
  const _bulletinStore = bulletinStore as BulletinStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadCappsCategory();
  }, []);

  /* istanbul ignore next */
  const loadCappsCategory = () => {
    UIStore.setPageLoader(true);
    _bulletinStore
      ?.loadCappsCategory()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const upsertCappsCategory = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _bulletinStore
      ?.upsertCappsCategory(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertCappsCategory'),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertCappsCategory(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addNewType = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new IdNameCodeModel() ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: `required|string|regex:${regex.alphaNumeric}|between:1,100`,
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        rules: 'required|string|max:10',
        isUnique: (value: string) => {
          return !_bulletinStore?.cappsCategory.some(({ code }) => Utilities.isEqual(code, value?.trim()));
        },
      },
    },
    {
      ...agGrid.actionColumn({ hide: !isSettingsEditable }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        getEditableState: node => !Boolean(node.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        const { id, code, name } = node.data as IdNameCodeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [NAME_CODE_FILTER.CODE]: code,
              [NAME_CODE_FILTER.NAME]: name,
            },
            searchHeader.searchValue,
            searchHeader.selectedOption
          )
        );
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', false);
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add Capps Category
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV2
        ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
        rightContent={rightContent}
        selectInputs={[ agGridUtilities.createSelectOption(NAME_CODE_FILTER, NAME_CODE_FILTER.NAME) ]}
        onFilterChange={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('bulletinStore')(observer(CappsCategory));

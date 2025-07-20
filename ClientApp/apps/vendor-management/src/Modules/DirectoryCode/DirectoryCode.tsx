import React, { FC, useEffect, useRef, ReactNode, useState } from 'react';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  useGridFilters,
  agGridUtilities,
  useAgGrid,
  AgGridActions,
  AgGridAutoComplete,
  AgGridCheckBox,
  useGridState,
  AgGridGroupHeader,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode, ICellEditorParams, ValueGetterParams } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  DIRECTORY_CODE_DATA_FILTERS,
  DirectoryAppliedContactModel,
  DirectoryCodeModel,
  SETTING_ID,
  SettingBaseModel,
  useVMSModuleSecurity,
  VENDOR_CONTACT_COMPARISON_FILTERS,
  
} from '../Shared';
import {
  UIStore,
  Utilities,
  regex,
  GridPagination,
  IClasses,
  IAPIGridRequest,
  SearchStore,
  GRID_ACTIONS,
  cellStyle,
  IAPIPageResponse,
  ViewPermission,
  SelectOption,
} from '@wings-shared/core';
import { BaseStore, SettingsStore, ContactMasterStore, DirectoryCodeStore } from '../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './DirectoryCode.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { gridFilters } from './fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { SearchHeaderV2, ISearchHeaderRef } from '@wings-shared/form-controls';
import { ContactMasterModel } from '../Shared/Models/ContactMaster.model';
import { forkJoin } from 'rxjs';
import { ConfirmDialog, ConfirmNavigate } from '@wings-shared/layout';
import { SETTING_NAME } from '../Shared/Enums/SettingNames.enum';
import { COLLECTION_NAMES } from '../Shared/Enums/CollectionName.enum';
import { VALIDATION_REGEX } from '../Shared/Enums/Spacing.enum';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { Chip, Tooltip } from '@material-ui/core';
import { AlertStore } from '@uvgo-shared/alert';

interface Props {
  settingsStore: SettingsStore;
  contactMasterStore: ContactMasterStore;
  directoryCodeStore: DirectoryCodeStore;
}

const DirectoryCode: FC<Props> = observer(({ settingsStore, contactMasterStore, directoryCodeStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_CONTACT_COMPARISON_FILTERS, DirectoryCodeModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const filtersApi = useGridFilters<VENDOR_CONTACT_COMPARISON_FILTERS>(gridFilters, gridState);
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const isStatusFilter = Utilities.isEqual(
    searchHeaderRef.current?.getSelectedOption('defaultOption'),
    VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_STATUS
  );

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const onInputChange = (colDef: ICellEditorParams, value): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (colDef: ICellEditorParams, value): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    const colId = colDef.column.getColId();
    directoryCodeStore.isContactValid = false;
    switch (colId) {
      case 'appliedContact': {
        const firstValueSelected = value[0]?.contact?.contactMethod?.id;
        if (!firstValueSelected) {
          return;
        }
        const isMismatchFound = value.slice(1).some(item => {
          const secondValueMethodId = item?.contact?.contactMethod?.id;
          return secondValueMethodId !== firstValueSelected;
        });

        if (isMismatchFound) {
          directoryCodeStore.isContactValid = true;
          AlertStore.critical('Please select the same contact method type for all values');
        }
        break;
      }
    }
  }

  function viewRenderer(
    contactChips: ContactMasterModel[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode {
    const numTags = contactChips?.length;
    const limitTags = 1;
    const chipsList = isReadMode ? contactChips : [ ...contactChips ].slice(0, limitTags);
    return (
      <div>
        {Utilities.customArraySort(chipsList, 'label').map((contactData: ContactMasterModel, index) => (
          <Tooltip title={contactData?.contact ? contactData?.contact : ''} key={index}>
            <>
              <Chip
                color="primary"
                id={contactData?.contact.id}
                key={contactData?.contact.id}
                label={contactData?.contact ? contactData?.contact?.label : ''}
                {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
              />
            </>
          </Tooltip>
        ))}
        {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
      </div>
    );
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact',
      minWidth: 330,
      field: 'appliedContact',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'viewRenderer',
      sortable: false,
      filter: false,
      filterValueGetter: ({ data }: ValueGetterParams) => data?.appliedContact,
      headerTooltip: 'Contact',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.appliedContact, null, true),
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact',
        displayKey: 'name',
        multiSelect: true,
        multiple: true,
        disableCloseOnSelect: true,
        valueGetter: (selectedOptions: DirectoryAppliedContactModel[]) => selectedOptions,
        renderTags: (values: DirectoryAppliedContactModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRenderer(values, getTagProps),
        getAutoCompleteOptions: () => {
          const contactList = contactMasterStore?.contactList || [];
          return contactList.map(contact =>
            DirectoryAppliedContactModel.deserialize({
              id: contact.id,
              contact: ContactMasterModel.deserialize(contact),
              directoryCodeId: 0,
            })
          );
        },
        rules: 'required',
      },
    },
    {
      headerName: 'Code',
      minWidth: 100,
      maxWidth: 200,
      field: 'code',
      headerTooltip: 'Code',
      cellEditorParams: {
        placeHolder: 'Code',
        ignoreNumber: true,
        rules: 'required',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      minWidth: 200,
      maxWidth: 200,
      cellStyle: { ...cellStyle() },
    },
  ];

  const saveRowData = (rowIndex: number) => {
    upsertDirectoryCode(rowIndex);
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },

        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.EDIT,
          },
          {
            title: 'Delete',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        getDisabledState: () => gridState.hasError || directoryCodeStore.isContactValid,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'appliedContact');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
            case GRID_ACTIONS.DELETE:
              confirmRemove(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressClickEdit: true,
      suppressScrollOnNewData: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        loadDropdownsData();
        agGrid._startEditingCell(rowIndex, colDef.field);
      },
      onSortChanged: e => {
        filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={vmsModuleSecurityV2.isEditable}>
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={'+'}
          disabled={gridState.isRowEditing || gridState.isProcessing}
          onClick={() => upsertNewDirectoryCode()}
        >
          Add Contact
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const upsertNewDirectoryCode = () => {
    const data = [ new DirectoryCodeModel() ];
    agGrid.addNewItems(data, { startEditing: false, colKey: 'appliedContact' });
    loadDropdownsData();
    gridState.setHasError(true);
  };

  const upsertDirectoryCode = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    model.appliedContact = DirectoryAppliedContactModel.deserializeList(model.appliedContact.map(item => ({
      ...item,
      id: item.appliedContactId || 0,
      contact: item.contact
    })));

    UIStore.setPageLoader(true);
    directoryCodeStore
      ?.upsertDirectoryCode(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsAllRowsSelected(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: (response: DirectoryCodeModel) => {
          response = DirectoryCodeModel.deserialize(response);
          agGrid._updateTableItem(rowIndex, response);
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'appliedContact');
          BaseStore.showAlert(error?.message, 0);
        },
      });
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
          }}
        />
      );
    } else {
      cancelEditing(rowIndex);
    }
  };

  const confirmRemove = (rowIndex: number): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this record?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          deleteDirectoryCode(rowIndex);
          ModalStore.close();
        }}
      />
    );
  };

  const deleteDirectoryCode = (rowIndex: number): void => {
    const model: DirectoryCodeModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    directoryCodeStore
      .removeDirectoryCode(model.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ model ]);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'appliedContact');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const filterCollection = (): IAPIGridRequest | null => {
    const searchHeader = searchHeaderRef.current;
    const chip = searchHeader.getFilters().chipValue?.valueOf();
    if (!searchHeader) {
      return null;
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType, searchHeader.selectedOption)
    );
    const propertyValue = chip?.length > 0 ? chip[0]?.label : searchHeader.searchValue ? searchHeader.searchValue : '';
    if (propertyValue === '') {
      return null;
    }
    const filters = [
      {
        propertyName: property?.apiPropertyName,
        propertyValue: propertyValue,
      },
    ];
    return {
      filterCollection: JSON.stringify(filters),
    };
  };

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT).subscribe();
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...filterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    directoryCodeStore
      .getDirectoryCodeGridData(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: IAPIPageResponse<DirectoryCodeModel>) => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        const allowSelectAll = response.totalNumberOfRecords <= response.pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const loadDropdownsData = () => {
    UIStore.setPageLoader(false);
    forkJoin([
      directoryCodeStore.getDirectoryCodeGridData(),
      settingsStore.getSettings(SETTING_ID.SETTING_CONTACT_METHOD, SETTING_NAME.CONTACT_METHOD),
      settingsStore.getSettings(SETTING_ID.SETTING_CONTACT_TYPE, SETTING_NAME.CONTACT_TYPE),
      settingsStore.getSettings(SETTING_ID.SETTING_ACCESS_LEVEL, SETTING_NAME.ACCESS_LEVEL),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <SearchHeaderV2
        placeHolder="Start typing to search"
        ref={searchHeaderRef}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(
            DIRECTORY_CODE_DATA_FILTERS,
            DIRECTORY_CODE_DATA_FILTERS.CONTACT,
            'defaultOption'
          ),
        ]}
        onResetFilterClick={() => {
          cancelEditing(0);
        }}
        rightContent={rightContent}
        onFilterChange={isInitEvent => {
          loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
          cancelEditing(0);
        }}
        isChipInputControl={isStatusFilter}
        chipInputProps={{
          options: isStatusFilter ? settingsStore.vendorContactStatus : [],
          allowOnlySingleSelect: true,
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        classes={{ customHeight: classes.customHeight }}
        disablePagination={gridState.isRowEditing || gridState.isProcessing}
      />
    </ConfirmNavigate>
  );
});
export default inject('settingsStore', 'contactMasterStore', 'directoryCodeStore')(DirectoryCode);

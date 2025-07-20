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
import { ColDef, GridOptions, RowNode, ICellEditorParams } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SETTING_ID, SettingBaseModel, useVMSModuleSecurity, VENDOR_CONTACT_COMPARISON_FILTERS } from '../Shared';
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
import { BaseStore, SettingsStore, ContactMasterStore, vendorManagementHeadersNew } from '../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './ContactMaster.styles';
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
import { AuditHistory, baseApiPath } from '@wings/shared';
import { VENDOR_AUDIT_MODULES } from '../Shared/Enums/AuditModules.enum';


interface Props {
  settingsStore: SettingsStore;
  contactMasterStore: ContactMasterStore;
}

const ContactMaster: FC<Props> = observer(({ settingsStore, contactMasterStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_CONTACT_COMPARISON_FILTERS, ContactMasterModel>(gridFilters, gridState);
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
    if (!value) {
      return;
    }
    const colId = colDef.column.getColId();
    if (colId == 'contactMethod') {
      validateContact(value);
    }
  };

  const validateContact = (value: SettingBaseModel) => {
    const contactFiled = agGrid.fetchCellInstance('contact');
    contactFiled?.setRules(getContactRule(value));
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const getContactRule = (value: SettingBaseModel): string => {
    if (!value.name) {
      return 'required';
    }
    switch (value.name.toLocaleLowerCase()) {
      case 'fax':
      case 'phone':
        return `required|between:7,15|regex:${regex.phoneNumberWithHyphen}`;
      case 'website':
        return 'required|string|between:3,320|url';
      case 'email':
        return `required|regex:${regex.email}`;
      case 'arinc':
      case 'sita':
        return `required|between:6,7|regex:${regex.alphaNumericWithoutSpaces}`;
      case 'aftn':
        return `required|between:6,8|regex:${regex.alphaNumericWithoutSpaces}`;
      default:
        return 'required';
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact Method',
      minWidth: 150,
      field: 'contactMethod',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Contact Method',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact Method',
        getAutoCompleteOptions: () => settingsStore.vendorContactMethod,
      },
    },
    {
      headerName: 'Contact',
      minWidth: 100,
      maxWidth: 200,
      field: 'contact',
      headerTooltip: 'Contact',
      cellEditorParams: {
        placeHolder: 'Contact',
        ignoreNumber: true,
        getRules: (params: ICellEditorParams) => getContactRule(params.data.contactMethod),
      },
    },
    {
      headerName: 'Contact Type',
      minWidth: 150,
      field: 'contactType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Contact Type',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact Type',
        getAutoCompleteOptions: () => settingsStore.vendorContactType,
      },
    },
    {
      headerName: 'Contact Name',
      minWidth: 100,
      field: 'contactName',
      headerTooltip: 'Contact Name',
      cellEditorParams: {
        placeHolder: 'Contact Name',
        ignoreNumber: true,
        rules: `string|between:0,200|regex:${regex.alphaNumericWithCommaSpace}`,
      },

    },
    {
      headerName: 'Title',
      minWidth: 100,
      field: 'title',
      headerTooltip: 'Title',
      cellEditorParams: {
        placeHolder: 'Title',
        ignoreNumber: true,
        rules: `string|between:2,50|regex:${regex.alphaNumericWithCommaSpace}|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`,
      },
    },
    {
      headerName: 'SMS Compatible',
      minWidth: 100,
      field: 'isSMSCompatible',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      headerTooltip: 'SMS Compatible',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'SMS Opt In',
      minWidth: 100,
      field: 'isSMSOpt',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      headerTooltip: 'SMS Opt In',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Status',
      minWidth: 100,
      field: 'status',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Status',
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore.vendorContactStatus,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'contact status',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'Access Level',
      minWidth: 100,
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Access Level',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => settingsStore.vendorAccessLevel,
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
    upsertContact(rowIndex);
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
            title: 'Audit',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.AUDIT,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'contactMethod');
              loadDropdownsData();
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
            case GRID_ACTIONS.AUDIT:
              const model: ContactMasterModel = agGrid._getTableItem(rowIndex);
              ModalStore.open(
                <AuditHistory
                  title={model.name}
                  entityId={model.id}
                  entityType={VENDOR_AUDIT_MODULES.CONTACTS}
                  baseUrl={`${baseApiPath.vendorManagementCoreUrl}`}
                  schemaName={VENDOR_AUDIT_MODULES.CONTACTS}
                  headers={vendorManagementHeadersNew}
                />
              );
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
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customAutoComplete: AgGridAutoComplete,
        customCellEditor: AgGridCellEditor,
        checkBoxRenderer: AgGridCheckBox,
        customHeader: AgGridGroupHeader,
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
          onClick={() => upsertNewContact()}
        >
          Add Contact
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const upsertNewContact = () => {
    const data = [ new ContactMasterModel() ];
    agGrid.addNewItems(data, { startEditing: false, colKey: 'contactMethod' });
    loadDropdownsData();
    gridState.setHasError(true);
  };

  const upsertContact = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    contactMasterStore
      ?.upsertMasterContact(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: ContactMasterModel) => {
          response = ContactMasterModel.deserialize(response);
          gridState.setIsProcessing(false);
          agGrid._updateTableItem(rowIndex, response);
        },
        error: error => {
          gridState.setIsProcessing(false);
          agGrid._startEditingCell(rowIndex, 'contactMethod');
          BaseStore.showAlert(error.message, model.id.toString());
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

  const searchCollection = (): IAPIGridRequest | null => {
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
    return property?.apiPropertyName?.includes('Status') && chip?.length != 0
      ? {
        filterCollection: JSON.stringify(filters),
      }
      : {
        searchCollection: JSON.stringify(filters),
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
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...searchCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    forkJoin([
      contactMasterStore.getVMSComparison(COLLECTION_NAMES.CONTACT, request),
      settingsStore.getSettings(SETTING_ID.SETTINGS_CONTACT_STATUS, 'ContactStatus'),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<ContactMasterModel>, IAPIPageResponse<SettingBaseModel>]) => {
        UIStore.setPageLoader(false);
        gridState.setPagination(new GridPagination({ ...response[0] }));
        gridState.setGridData(response[0].results);
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const loadDropdownsData = () => {
    UIStore.setPageLoader(false);
    forkJoin([
      contactMasterStore.getVMSComparison(COLLECTION_NAMES.CONTACT),
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
            VENDOR_CONTACT_COMPARISON_FILTERS,
            VENDOR_CONTACT_COMPARISON_FILTERS.CONTACT_METHOD,
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
export default inject('settingsStore', 'contactMasterStore')(ContactMaster);

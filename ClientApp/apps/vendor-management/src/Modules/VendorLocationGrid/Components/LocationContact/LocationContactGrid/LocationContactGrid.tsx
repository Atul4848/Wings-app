import {
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  UIStore,
  Utilities,
  cellStyle,
  SelectOption,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, useEffect, useState } from 'react';
import { 
  ContactMasterStore, 
  BaseStore, 
  SettingsStore, 
  VendorLocationStore, 
  vendorManagementHeadersNew 
} from '../../../../../Stores';
import { NavigateFunction, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from '../../UpsertLocation.styles';
import { AuditHistory, baseApiPath, VIEW_MODE } from '@wings/shared';
import { useAgGrid, CustomAgGridReact, useGridState } from '@wings-shared/custom-ag-grid';
import {
  SETTING_ID,
  useVMSModuleSecurity,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VendorLocationModel,
} from '../../../../Shared';
import { gridFilters } from '../../../fields';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { ChildGridWrapper, CollapsibleWithButton, ConfirmDialog } from '@wings-shared/layout';
import { ContactMasterModel } from '../../../../Shared/Models/ContactMaster.model';
import { VendorLocationContactModel } from '../../../../Shared/Models/VendorLocationContact.model';
import { COLLECTION_NAMES } from '../../../../Shared/Enums/CollectionName.enum';
import { VENDOR_AUDIT_MODULES } from '../../../../Shared/Enums/AuditModules.enum';
interface Props {
  classes: IClasses;
  settingsStore?: SettingsStore;
  vendorLocationStore?: VendorLocationStore;
  contactMasterStore?: ContactMasterStore;
  navigate: NavigateFunction;
  params?: { vendorId: number; vendorName: string; vendorCode: string };
  viewMode: VIEW_MODE;
  locationData: VendorLocationModel;
  setLocationGridDisabled: React.Dispatch<React.SetStateAction<Boolean>>;
  setIsNewLocationContactAdded: React.Dispatch<React.SetStateAction<Boolean>>;
  serviceCommGridDisabled: boolean;
}

const LocationContactGrid: FC<Props> = ({
  classes,
  settingsStore,
  contactMasterStore,
  locationData,
  vendorLocationStore,
  setLocationGridDisabled,
  setIsNewLocationContactAdded,
  serviceCommGridDisabled
}) => {
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LOCATION_COMPARISON_FILTERS, VendorLocationContactModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const [ isVendorContactDataAdded, setIsVendorContactDataAdded ] = useState(false);
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(locationData);

  useEffect(() => {
    loadLocationContactGridData();
    loadInitialData();
  }, [ isVendorContactDataAdded ]);

  const loadInitialData = () => {
    const locationId = params.locationId;
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.getVendorLocationById(parseInt(`${locationId}`))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorLocationModel) => {
        setSelectedVendorLocation(response);
      });
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'contact':
        const contactFilter = searchValue
          ? [
            {
              propertyName: 'Contact',
              propertyValue: searchValue,
            },
            {
              propertyName: 'ContactName',
              operator: 'or',
              propertyValue: searchValue,
            },
            {
              propertyName: 'ContactMethod.Name',
              operator: 'or',
              propertyValue: searchValue,
            },
            {
              propertyName: 'ContactType.Name',
              operator: 'or',
              propertyValue: searchValue,
            },
          ]
          : [];
        const request: IAPIGridRequest = {
          searchCollection: JSON.stringify(contactFilter),
        };
        contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT, request).subscribe();
        break;
      default:
        break;
    }
    return;
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact',
      minWidth: 150,
      field: 'contact',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'contact'),
      headerTooltip:'Contact',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact',
        getAutoCompleteOptions: () => contactMasterStore?.contactList,
        rules: 'required',
        onSearch: (value: string) => onSearch(value, 'contact'),
      },
    },
    {
      headerName: 'Usage type',
      field: 'contactUsegeType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name,
      comparator: (current, next) => Utilities.customComparator(current, next, 'contactUsegeType'),
      headerTooltip:'Usage type',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Usage Type',
        getAutoCompleteOptions: () => settingsStore?.vendorContactUsageType,
        valueGetter: (option: SelectOption) => option.value,
        rules: 'required',
      },
    },
    {
      headerName: 'Status',
      minWidth: 100,
      field: 'status',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'status'),
      headerTooltip:'Status',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => settingsStore?.vendorContactStatus,
        valueGetter: (option: SelectOption) => option.value,
        rules: 'required',
      },
    },
    {
      headerName: 'Access Level',
      minWidth: 100,
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'accessLevel'),
      headerTooltip:'Access Level',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => settingsStore?.vendorAccessLevel,
        valueGetter: (option: SelectOption) => option.value,
        rules: 'required',
      },
    },
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      hide: !vmsModuleSecurityV2.isEditable,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const upsertNewContact = () => {
    setLocationGridDisabled(true);
    const data = [ new VendorLocationContactModel() ];
    agGrid.addNewItems(data, { startEditing: false, colKey: 'contact' });
    gridState.setHasError(true);
  };

  const getConfirmation = (rowIndex: number): void => {
    gridState.isAllRowsSelected
      ? ModalStore.open(
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
      )
      : cancelEditing(rowIndex);
  };

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
    setLocationGridDisabled(false);
    gridState.hasError ? loadLocationContactGridData() : ''
  };

  const loadLocationContactGridData = (pageRequest?: IAPIGridRequest) => {
    gridState.setIsProcessing(true);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'VendorLocation.VendorLocationId',
          propertyValue: params.id,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.VENDOR_LOCATION_CONTACT, request),
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT),
      settingsStore?.getSettings( SETTING_ID.SETTINGS_CONTACT_STATUS, 'ContactStatus'),
      settingsStore?.getSettings( SETTING_ID.SETTING_USAGES_TYPE, 'UsageType'),
      settingsStore?.getSettings( SETTING_ID.SETTING_ACCESS_LEVEL, 'AccessLevel'),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<ContactMasterModel>]) => {
        UIStore.setPageLoader(false);
        gridState.setPagination(new GridPagination({ ...response[0] }));
        gridState.setGridData(response[0].results);
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const onInputChange = (): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const saveRowData = (rowIndex: number) => {
    upsertVendorLocationContact(rowIndex);
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
        actionMenus: () => [
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
          const model: VendorLocationContactModel = agGrid._getTableItem(rowIndex);
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'contact');
              setLocationGridDisabled(true);
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
            case GRID_ACTIONS.AUDIT:
              ModalStore.open(
                <AuditHistory
                  title={model.name}
                  entityId={model.id}
                  entityType={VENDOR_AUDIT_MODULES.VENDORLOCATIONCONTACT}
                  baseUrl={`${baseApiPath.vendorManagementCoreUrl}`}
                  schemaName={VENDOR_AUDIT_MODULES.VENDORLOCATIONCONTACT}
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
      suppressScrollOnNewData: true,       
      isExternalFilterPresent: () => false,
      suppressClickEdit: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        agGrid._startEditingCell(rowIndex, colDef.field);
        setLocationGridDisabled(true);
      },
    };
  };

  const upsertVendorLocationContact = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    gridState.setIsProcessing(true);
    setLocationGridDisabled(false);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    contactMasterStore
      ?.upsertVendorLocationContact(model.serialize([ params.id ], [ model.id ], params.vendorId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false)
        })
      )
      .subscribe({
        next: (response: VendorLocationContactModel[]) => {
          agGrid._updateTableItem(rowIndex, response[0]);
          setIsNewLocationContactAdded(true);
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'contact');
          setLocationGridDisabled(true);
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  return (
    <div className={`${classes.root} ${serviceCommGridDisabled ? `${classes.disabledGrid}`: ''} `}>
      <CollapsibleWithButton
        title="Location Contact Details"
        buttonText="Associate Contact"
        isButtonDisabled={gridState.isProcessing || gridState.isRowEditing}
        onButtonClick={() => upsertNewContact()}
        titleVariant="h6"
        hasPermission={vmsModuleSecurityV2.isEditable}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={gridState.data}
            gridOptions={gridOptions()}
            serverPagination={true}
            paginationData={gridState.pagination}
            onPaginationChange={loadLocationContactGridData}
            classes={{ customHeight: classes.customHeight }}
            disablePagination={gridState.isRowEditing || gridState.isProcessing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default inject('settingsStore', 'contactMasterStore')(withStyles(styles)(observer(LocationContactGrid)));

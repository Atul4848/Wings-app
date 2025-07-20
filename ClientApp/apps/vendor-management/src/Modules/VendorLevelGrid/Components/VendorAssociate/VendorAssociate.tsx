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
  ViewPermission,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { ContactMasterStore, SettingsStore, VendorLocationStore, VendorManagementStore } from '../../../../Stores';
import { NavigateFunction, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { Box, debounce, OutlinedInput, TextField, Typography, withStyles } from '@material-ui/core';
import { useStyles } from '../UpsertVendor.styles';
import { AirportModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  Airports,
  SETTING_ID,
  useVMSModuleSecurity,
  VENDOR_LEVEL_COMPARISON_FILTERS,
  VendorLocationModel,
  VendorManagmentModel,
  
} from '../../../Shared';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Dialog } from '@uvgo-shared/dialog';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import AssociateContact from './AssociateContact/AssociateContact';
import { ContactMasterModel } from '../../../Shared/Models/ContactMaster.model';
import { VendorContact } from '../../../Shared/Models/VendorContact.model';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { gridFilters } from '../../fields';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';
import { VendorLocationContactModel } from '../../../Shared/Models/VendorLocationContact.model';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { EditIcon } from '@uvgo-shared/icons';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { PersonAdd } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { ModeStore } from '@wings-shared/mode-store';

interface Props {
  // classes: IClasses;
  settingsStore?: SettingsStore;
  vendorManagementStore?: VendorManagementStore;
  vendorLocationStore: VendorLocationStore;
  contactMasterStore?: ContactMasterStore;
  navigate: NavigateFunction;
  params?: { vendorId: number; vendorName: string; vendorCode: string };
  viewMode: VIEW_MODE;
  vendorData: VendorManagmentModel;
}

const VendorAssociate: FC<Props> = ({
  // classes,
  settingsStore,
  contactMasterStore,
  viewMode,
  vendorData,
  vendorManagementStore,
  vendorLocationStore,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LEVEL_COMPARISON_FILTERS, VendorLocationContactModel>(gridFilters, gridState);
  const useUpsert = useBaseUpsertComponent<VendorManagmentModel>(params, null, undefined);
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const [ isVendorContactDataAdded, setIsVendorContactDataAdded ] = useState(false);
  const [ selectedVendor, setSelectedVendor ] = useState(VendorManagmentModel.deserialize(vendorData));
  const [ isModalOpen, setIsModelOpen ] = useState(false);
  const classes = useStyles();
  const isEditable = (): boolean => useUpsert.isEditable || useUpsert.isDetailView;

  useEffect(() => {
    loadVendorContactData();
    loadInitialData();
    vendorLocationStore.getVmsIcaoCode().subscribe();
  }, [ isVendorContactDataAdded ]);

  const loadInitialData = () => {
    const vendorId = params.vendorId;
    UIStore.setPageLoader(true);
    vendorManagementStore
      ?.getVendorById(parseInt(`${vendorId}`))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorManagmentModel) => {
        setSelectedVendor(response);
      });
  };

  const onSearch = (searchValue: string): void => {
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
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Contact',
      minWidth: 150,
      field: 'contact',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'contact'),
      headerTooltip: 'Contact',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Contact',
        getAutoCompleteOptions: () => contactMasterStore?.contactList,
        onSearch: (value: string) => onSearch(value),
        rules: 'required',
      },
    },
    {
      headerName: 'Contact Location',
      field: 'vendorLocation',
      cellEditor: 'customAutoComplete',
      minWidth: 250,
      valueFormatter: ({ value }) => value && value.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'vendorLocation'),
      headerTooltip: 'Contact Location',
      cellEditorParams: {
        placeHolder: 'Contact Location',
        getAutoCompleteOptions: () => vendorLocationStore.vendorLocationList,
        getDisableState: ({ data }) => !Boolean(data.vendorLocation),
        isRequired: ({ data }) => Boolean(data.vendorLocation),
      },
    },
    {
      headerName: 'Usage type',
      field: 'contactUsegeType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name,
      comparator: (current, next) => Utilities.customComparator(current, next, 'contactUsegeType'),
      headerTooltip: 'Usage type',
      cellEditorParams: {
        isRequired: true,
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
      headerTooltip: 'Status',
      cellEditorParams: {
        isRequired: true,
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
      headerTooltip: 'Access Level',
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
      cellRenderer: 'viewRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(rowIndex, node.data),
      },
      cellStyle: { ...cellStyle() },
    },
  ];

  const IcaoStepModal = observer(({ rowIndex, rowData, onClose }) => {
    const [ step, setStep ] = useState(1);
    const isLocationContact = rowData.constructor.name === 'VendorLocationContactModel';

    const handleFinalConfirm = () => {
      if (!isLocationContact) {
        upsertVendorContact(rowIndex, true);
      }
      onClose();
    };

    const debouncedSearch = useCallback(
      debounce((value: string) => {
        vendorLocationStore.searchAirport(value);
      }, 300),
      []
    );

    useEffect(() => {
      return () => {
        debouncedSearch.clear();
      };
    }, [ debouncedSearch ]);

    useEffect(() => {
      vendorLocationStore.getVmsIcaoCode().subscribe();
    });

    const StepOne = observer(() => (
      <Box className={classes.modalContainer}>
        <Typography className={classes.heading}>Enter the ICAO</Typography>
        <Autocomplete
          autoHighlight
          openOnFocus
          disableCloseOnSelect={false}
          options={vendorLocationStore.airportList || []}
          value={contactMasterStore.selectedAirport ?? null}
          getOptionLabel={option => option?.label ?? ''}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') {
              if (!value) {
                vendorLocationStore.getVmsIcaoCode().subscribe();
                return;
              }
              debouncedSearch(value);
            }
          }}
          getOptionSelected={(option, value) => option?.airportId === value?.airportId}
          onChange={(event, newValue) => {
            contactMasterStore.selectedAirport = newValue ? Airports.deserializeAirportReference(newValue) : null;
          }}
          onBlur={() => {
            if (!contactMasterStore.selectedAirport) {
              vendorLocationStore.getVmsIcaoCode().subscribe();
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select"
              InputProps={{
                ...params.InputProps,
                endAdornment: <>{params.InputProps.endAdornment}</>,
              }}
            />
          )}
          className={classes.inputDropdown}
        />
      </Box>
    ));

    const StepTwo = () => (
      <Box className={classes.modalContainer}>
        <Box display="flex" justifyContent="center" mb={2}>
          <WarningRoundedIcon className={classes.warningIcon} />
        </Box>
        <Typography className={classes.heading2}>Submit Details</Typography>
        <Typography align="center">
          This is about to send an external email. Are you sure you've got the right handler and ICAO?
        </Typography>
      </Box>
    );

    return (
      <Dialog
        title={step === 1 && `Create a user for ${rowData?.vendor?.label}`}
        open={true}
        onClose={onClose}
        closeBtn={false}
        classes={{ title: classes.titlefont }}
        dialogContent={() => (step === 1 ? <StepOne /> : <StepTwo />)}
        dialogActions={() => (
          <Box display="flex" justifyContent={step === 2 ? 'center' : 'flex-end'} gap={2} width="100%">
            {step === 1 ? (
              <Box sx={{ display: 'flex' }}>
                <div className={classes.defaultButton}>
                  <PrimaryButton variant="text" size="large" onClick={onClose}>
                    Cancel
                  </PrimaryButton>
                </div>
                <div className={classes.primaryButton}>
                  <PrimaryButton
                    variant="contained"
                    color="primary"
                    disabled={!contactMasterStore.selectedAirport}
                    onClick={() => setStep(2)}
                  >
                    Confirm
                  </PrimaryButton>
                </div>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <div className={classes.defaultButton}>
                  <PrimaryButton variant="text" size="large" color="primary" onClick={() => setStep(1)}>
                    No
                  </PrimaryButton>
                </div>
                <div className={classes.primaryButton}>
                  <PrimaryButton variant="contained" color="primary" onClick={handleFinalConfirm}>
                    Yes
                  </PrimaryButton>
                </div>
              </Box>
            )}
          </Box>
        )}
      />
    );
  });

  const showModal = (rowIndex, rowData) => {
    contactMasterStore.selectedAirport = null;
    ModalStore.open(
      <IcaoStepModal
        rowIndex={rowIndex}
        rowData={rowData}
        onClose={() => {
          ModalStore.close();
          contactMasterStore.selectedAirport = null;
        }}
      />
    );
  };

  const viewRenderer = (rowIndex, rowData): ReactNode => {
    const isLocationContact = rowData.constructor.name === 'VendorLocationContactModel';
    return (
      <div style={{ padding: '10px' }}>
        <PrimaryButton
          onClick={() => {
            agGrid._startEditingCell(rowIndex, 'contact');
          }}
        >
          <EditIcon />
        </PrimaryButton>
        {ModeStore.isDevModeEnabled && rowData?.contact?.contactMethod?.id === 3 && (
          <PrimaryButton style={{ marginLeft: '0px' }} onClick={() => showModal(rowIndex, rowData)}>
            <PersonAdd />
          </PrimaryButton>
        )}
      </div>
    );
  };

  const addVendorContactRow = (isLocationContactBtnClicked: boolean): void => {
    setIsVendorContactDataAdded(false);
    ModalStore.open(
      <AssociateContact
        selectedVendor={selectedVendor}
        setIsVendorContactDataAdded={setIsVendorContactDataAdded}
        viewMode={params.viewMode}
        vendorId={params.vendorId}
        isLocationContactBtnClicked={isLocationContactBtnClicked}
        setIsModelOpen={setIsModelOpen}
      />
    );
  };

  const loadVendorContactData = (pageRequest?: IAPIGridRequest) => {
    gridState.setIsProcessing(true);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: 500,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Vendor.Id',
          propertyValue: params.vendorId,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    const locationRequest: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: 500,
      filterCollection: JSON.stringify([
        {
          propertyName: 'VendorId',
          propertyValue: params.vendorId,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.VENDOR_CONTACT, request),
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.VENDOR_LOCATION_CONTACT, locationRequest),
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT),
      vendorLocationStore?.getVMSComparison(request),
      settingsStore?.getSettings(SETTING_ID.SETTINGS_CONTACT_STATUS, 'ContactStatus'),
      settingsStore?.getSettings(SETTING_ID.SETTING_USAGES_TYPE, 'UsageType'),
      settingsStore?.getSettings(SETTING_ID.SETTING_ACCESS_LEVEL, 'AccessLevel'),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<ContactMasterModel>, IAPIPageResponse<VendorLocationModel>]) => {
        const merge = [ ...response[0].results, ...response[1].results ];
        UIStore.setPageLoader(false);
        gridState.setPagination(new GridPagination({ ...response[0], ...response[1] }));
        gridState.setGridData(merge);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const isHasPermissionToAddContact = (): boolean => {
    return !isEditable() || vmsModuleSecurityV2.isEditable;
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
    const model = agGrid._getTableItem(rowIndex);
    if (model.vendorLocation) {
      upsertVendorLocationContact(rowIndex);
    } else {
      upsertVendorContact(rowIndex, false);
    }
  };

  const removeUnsavedRow = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        isActionMenu: false,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'contact');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      paginationPageSize: 500,
      pagination: false,
      suppressClickEdit: true,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadVendorContactData({ pageNumber: 1 }),
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        agGrid._startEditingCell(rowIndex, colDef.field);
      },
    };
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
            removeUnsavedRow(rowIndex);
          }}
        />
      );
    } else {
      removeUnsavedRow(rowIndex);
    }
  };

  const upsertVendorContact = (rowIndex: number, isInvitationSent?: boolean): void => {
    gridState.setIsProcessing(true);
    gridState.gridApi.stopEditing();
    let model = agGrid._getTableItem(rowIndex);
    if (isInvitationSent) {
      if (!model.vendorOnBoardInvitation) {
        model.vendorOnBoardInvitation = {};
      }
      model.vendorOnBoardInvitation.airportReference = contactMasterStore.selectedAirport;
      model.vendorOnBoardInvitation.isInviteEmailSent = isInvitationSent;
    }
    model = VendorContact.deserialize(model);
    UIStore.setPageLoader(true);
    contactMasterStore
      ?.upsertVendorContact(model.serialize(), isInvitationSent)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: VendorContact) => {
          response = VendorContact.deserialize(response);
          agGrid._updateTableItem(rowIndex, response);
          ModalStore.close();
          contactMasterStore.selectedAirport = null;
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'contact');
          useUpsert.showAlert(error.message, model.id.toString());
        },
      });
  };

  const upsertVendorLocationContact = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    contactMasterStore
      ?.upsertVendorLocationContact(model.serialize([ model.vendorLocation.id ], [ model.id ], model.vendorId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: VendorLocationContactModel) => {
          response = VendorLocationContactModel.deserialize(response);
          agGrid._updateTableItem(rowIndex, response[0]);
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'contact');
          useUpsert.showAlert(error.message, model.id.toString());
        },
      });
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendor?.label} />}
        backNavTitle="Vendors"
        hideActionButtons={false}
        backNavLink="/vendor-management"
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <div className={classes.addEditVendorWrapper}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
          {viewMode !== VIEW_MODE.NEW ? (
            <div className={classes.gridHeight}>
              <div className={classes.buttonContainer}>
                <ViewPermission hasPermission={isHasPermissionToAddContact()}>
                  <PrimaryButton
                    variant="contained"
                    disabled={gridState.isProcessing || gridState.isRowEditing}
                    onClick={() => addVendorContactRow(false)}
                  >
                    Associate Contact
                  </PrimaryButton>
                </ViewPermission>
                <ViewPermission hasPermission={isHasPermissionToAddContact()}>
                  <PrimaryButton
                    variant="contained"
                    disabled={gridState.isProcessing || gridState.isRowEditing}
                    onClick={() => addVendorContactRow(true)}
                  >
                    Associate Location Contact
                  </PrimaryButton>
                </ViewPermission>
              </div>
              <CustomAgGridReact
                isRowEditing={gridState.isRowEditing}
                rowData={gridState.data}
                gridOptions={gridOptions()}
                serverPagination={false}
                paginationData={gridState.pagination}
                onPaginationChange={loadVendorContactData}
                classes={{ customHeight: classes.customHeight }}
                hidePagination={true}
                disablePagination={gridState.isRowEditing || gridState.isProcessing}
              />
            </div>
          ) : (
            ''
          )}
        </DetailsEditorWrapper>
      </div>
      {isModalOpen && (
        <ConfirmDialog
          title="Confirm Changes"
          message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
          yesButton="Confirm"
          onNoClick={() => setIsModelOpen(false)}
          onYesClick={() => {
            setIsModelOpen(false);
            ModalStore.close();
          }}
          onCloseClick={() => setIsModelOpen(false)}
          disableBackdropClick={true}
        />
      )}
    </ConfirmNavigate>
  );
};

export default inject(
  'settingsStore',
  'vendorManagementStore',
  'contactMasterStore',
  'vendorLocationStore'
)(observer(VendorAssociate));

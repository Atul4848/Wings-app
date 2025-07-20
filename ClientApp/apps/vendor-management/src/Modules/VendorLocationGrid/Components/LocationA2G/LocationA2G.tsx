import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { SETTING_ID, useVMSModuleSecurity, VENDOR_LOCATION_HOURS_FILTERS, VendorLocationModel } from '../../../Shared';
import { 
  SettingsStore, VendorLocationStore, DocumentUploadStore, BaseStore, ContactMasterStore 
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './LocationA2G.styles';
import { inject, observer } from 'mobx-react';
import { ViewInputControls } from '../../../Shared/Components/ViewInputControls/ViewInputControls';
import { fields } from './Fields';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  IAPISearchFiltersDictionary,
  IClasses,
  IOptionValue,
  UIStore,
  GRID_ACTIONS,
  Loader,
  Utilities,
  cellStyle,
  regex,
  IAPIGridRequest,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import {
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
  ConfirmNavigate,
  ConfirmDialog,
  CollapsibleWithButton,
} from '@wings-shared/layout';
import { EDITOR_TYPES, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { LocationA2GModel } from '../../../Shared/Models/LocationA2G.model';
import UploadDocumentFile from '../../../Shared/Components/UploadDocumentFile/UploadDocumentFile';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIA2GFile } from '../../../Shared/Interfaces/Response/API-Response-VendorLocation';
import { CloudUpload } from '@material-ui/icons';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode, ValueFormatterParams, ICellEditorParams, ICellEditor } from 'ag-grid-community';
import { LocationA2GAgentModel } from '../../../Shared/Models/LocationA2GAgent.model';
import { hoursGridFilters } from '../../fields';
import { DownloadIcon, UploadIcon } from '@uvgo-shared/icons';
import { Button, Grid, Tooltip, Typography } from '@material-ui/core';
import {
  IAPIDownloadA2GALocationFile,
  IAPIDownloadA2GAgentFile,
} from '../../../Shared/Interfaces/Request/API-Request-VendorLocationA2G.interface';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import { forkJoin } from 'rxjs';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';

interface Props {
  settingsStore: SettingsStore;
  vendorLocationStore: VendorLocationStore;
  documentUploadStore?: DocumentUploadStore;
  contactMasterStore: ContactMasterStore;
  params?: { viewMode: VIEW_MODE; id: Number };
  classes?: IClasses;
  searchFilters: IAPISearchFiltersDictionary;
}

const LocationA2G: FC<Props> = observer(
  ({ settingsStore, vendorLocationStore, documentUploadStore, searchFilters, contactMasterStore }) => {
    const classes = useStyles();
    const unsubscribe = useUnsubscribe();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const progressLoader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
    const params = useParams();
    const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
    const useUpsert = useBaseUpsertComponent<LocationA2GModel>(params, fields, searchFilters);
    const gridState = useGridState();
    const agGrid = useAgGrid<VENDOR_LOCATION_HOURS_FILTERS, LocationA2GAgentModel>(hoursGridFilters, gridState);
    const formRef = useUpsert.form;
    const navigate = useNavigate();
    const [ isAir2GroundEmailHidden, setIsAir2GroundEmailHidden ] = useState(true);

    useEffect(() => {
      useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
      if (params.id) {
        loadVendorLocationData();
      }
      documentUploadStore.documentUpdated = false;
    }, []);
    

    const isEditable = () => useUpsert.isEditable && vmsModuleSecurityV2.isEditable;

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
            propertyName: 'ContactType.Name',
            operator: 'or',
            propertyValue: searchValue,
          },
          {
            propertyName: 'ContactMethod.Name',
            operator: 'and',
            propertyValue: 'Email',
          },
        ]
        : [
          {
            propertyName: 'ContactMethod.Name',
            propertyValue: 'Email',
          }
        ];
      const request: IAPIGridRequest = {
        searchCollection: JSON.stringify(contactFilter),
      };
      contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT, request).subscribe();
    };
    
    const loadVendorLocationData = () => {
      UIStore.setPageLoader(true);
      const request: IAPIGridRequest = {
        pageNumber: gridState.pagination.pageNumber,
        pageSize: 500,
        filterCollection: JSON.stringify([
          {
            propertyName: 'ContactMethod.Name',
            propertyValue: 'Email',
          },
        ]),
        ...agGrid.filtersApi.gridSortFilters(),
      };
      forkJoin([
        contactMasterStore?.getVMSComparison(COLLECTION_NAMES.CONTACT, request),
        vendorLocationStore?.getVendorLocationById(params.id)
      ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(
          ([ contactResponse, vendorLocationResponse ]) => {
            
            setIsAir2GroundEmailHidden(!vendorLocationResponse.vendorLocationA2G?.isA2GCommCopy);

            if (vendorLocationResponse) {
              const { vendorLocationA2G } = vendorLocationResponse;
              if (vendorLocationA2G) {
                useUpsert.setFormValues(LocationA2GModel.deserialize(vendorLocationA2G));
                if (vendorLocationA2G.a2GAgent) {
                  gridState.setGridData(LocationA2GAgentModel.deserializeList(vendorLocationA2G.a2GAgent));
                }
              }
              setSelectedVendorLocation(vendorLocationResponse);
            }
          });
    };
    
    

    const upsertVendorLocationA2G = (): void => {
      const request = new LocationA2GModel({ ...useUpsert.form.values() });
      
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.upsertVendorLocationA2G(
          request.serialize(
            vendorLocationStore?.a2gFileUri,
            params.id,
            LocationA2GAgentModel.deserializeList(agGrid._getAllTableRows()),
            useUpsert.getField('a2GEmail').value?.id
          )
        )
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: LocationA2GModel) => {
            useUpsert.form.reset();
            
            useUpsert.setFormValues(response);
            documentUploadStore.file = null;
            vendorLocationStore.a2gFileUri = null;
            documentUploadStore.documentUpdated = false;
            agGrid.filtersApi.resetColumnFilters();
          },
          error: error => {
            // errorHandler(error?.response?.data?.errors);
            if (error.response.data.errors) {
              errorHandler(error.response.data.errors, request.id.toString());
              return;
            }
            BaseStore.showAlert(error.message, request.id);
          },
        });
    };

    const onValueChange = (value: IOptionValue, fieldKey: string): void => {
      switch (fieldKey) {
        case 'isA2GCommCopy':
          setIsAir2GroundEmailHidden(!value)
          value ? useUpsert.getField('a2GEmail').set('rules','required') : 
            useUpsert.getField('a2GEmail').set('rules', '')
          break;
        default:
          break;
      }
      useUpsert.getField(fieldKey).set(value);
      documentUploadStore.documentUpdated = true;
    };

    
    const profileEndAdornment = (): ReactNode => {
      return (
        <CloudUpload
          onClick={() =>
            onRequestImportDocument('Upload UA Agent location File', () => uploadDocumentFile(), documentUploadStore)
          }
          className={classes.buttonStyle}
        />
      );
    };

    const groupInputControls = (): IGroupInputControls[] => {
      return [
        {
          title: '',
          inputControls: [
            {
              fieldKey: 'id',
              type: EDITOR_TYPES.TEXT_FIELD,
              isHidden: true,
            },
            {
              fieldKey: 'vendorLocationId',
              type: EDITOR_TYPES.TEXT_FIELD,
              isHidden: true,
            },
            {
              fieldKey: 'a2GLocationType',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore.a2GLocationType,
            },
            {
              fieldKey: 'isA2GCommCopy',
              type: EDITOR_TYPES.CHECKBOX,
            },
            {
              fieldKey: 'a2GEmail',
              type: EDITOR_TYPES.DROPDOWN,
              options: contactMasterStore.contactList,
              isHidden: isAir2GroundEmailHidden
            },
            {
              fieldKey: 'locationDocUri',
              type: EDITOR_TYPES.TEXT_FIELD,
              isReadOnly: true,
              endAdormentValue: profileEndAdornment(),
              customLabel: field => {
                const pdfUri = useUpsert.getField(field.key).value;
                return (
                  <div className={classes.pdfIcon}>
                    <span>UA Agent location PDF</span>
                    <Tooltip title="View UA Agent location PDF">
                      {
                        useUpsert.getField('id').value?(
                          <Button disabled={!pdfUri} onClick={() => downloadA2GLocationFile()}>
                            <InsertPhotoIcon className={classes?.imageIcon} />
                          </Button>):<></>
                      }
                    </Tooltip>
                  </div>
                );
              },
            },
            {
              fieldKey: 'locationDocUri',
              type: EDITOR_TYPES.CUSTOM_COMPONENT,
              isHidden: true,
            },
            {
              fieldKey: 'arrivalLogistic',
              type: EDITOR_TYPES.RICH_TEXT_EDITOR,
              isFullFlex: true,
              showExpandButton: false,
              multiline: true,
            },
            {
              fieldKey: 'departureLogistic',
              type: EDITOR_TYPES.RICH_TEXT_EDITOR,
              isFullFlex: true,
              showExpandButton: false,
            },
          ],
        },
      ];
    };

    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={<CustomTooltip title={selectedVendorLocation.label} />}
          backNavTitle="Vendor Location"
          hideActionButtons={false}
          backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
          disableActions={!formRef.isValid || !documentUploadStore.documentUpdated || gridState.isRowEditing}
          isEditMode={isEditable()}
          hasEditPermission={vmsModuleSecurityV2.isEditable}
          onAction={action => onAction(action)}
          showStatusButton={false}
          isActive={true}
        />
      );
    };

    const onAction = (action: GRID_ACTIONS): void => {
      switch (action) {
        case GRID_ACTIONS.EDIT:
          const redirectUrl =
            params.operationCode === 'upsert'
              ? `/vendor-management/vendor-location/upsert/${params.vendorId}/${params.id}/edit/vendor-location-a2g`
              : `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${params.id}/edit`;
          navigate(redirectUrl);
          useUpsert.setViewMode(VIEW_MODE.EDIT);
          break;
        case GRID_ACTIONS.SAVE:
          upsertVendorLocationA2G();
          break;
        default:
          documentUploadStore.file = null;
          vendorLocationStore.a2gFileUri = null;
          navigate(
            params.operationCode === 'upsert'
              ? '/vendor-management/vendor-location'
              : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`
          );
          break;
      }
    };

    const onFocus = (fieldKey: string): void => {
      switch (fieldKey) {
        case 'a2GLocationType':
          settingsStore.getSettings(SETTING_ID.SETTING_A2G_LOCATION_TYPE, 'A2GLocationType').subscribe();
          break;
        default:
          break;
      }
    };

    const errorHandler = (errors: object): void => {
      Object.values(errors)?.forEach(errorMessage => AlertStore.info(errorMessage[0]));
    };

    const uploadDocumentFile = (): void => {
      UIStore.setPageLoader(true);
      progressLoader.setLoadingState(true);
      vendorLocationStore
        ?.imporA2GFile(documentUploadStore.file[0], params.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            progressLoader.setLoadingState(false);
          })
        )
        .subscribe({
          next: (response: IAPIA2GFile) => {
            if (response) {
              vendorLocationStore.a2gFileUri = response.results;
              documentUploadStore.documentUpdated = true;
              AlertStore.info('Vendor Location A2G File imported successfully');
              useUpsert.getField('locationDocUri').set(vendorLocationStore.a2gFileUri);
              ModalStore.close();
            }
          },
          error: error => {
            errorHandler(error.response.data.errors);
          },
        });
    };

    const uploadAgentDocumentFile = (): void => {
      UIStore.setPageLoader(true);
      progressLoader.setLoadingState(true);
      vendorLocationStore
        ?.imporA2GAgentFile(vendorLocationStore.file[0], params.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            progressLoader.setLoadingState(false);
          })
        )
        .subscribe({
          next: (response: IAPIA2GFile) => {
            if (response) {
              vendorLocationStore.a2gAgentFileUri = response.results;
              gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
              AlertStore.info('Vendor Location A2G Agent File imported successfully');
              ModalStore.close();
            }
          },
          error: error => {
            errorHandler(error.response.data.errors);
          },
        });
    };

    const onRequestImportDocument = (title: string, uploadfile: () => void, store: any): void => {
      ModalStore.open(
        <UploadDocumentFile
          fileType=".pdf"
          title={title}
          uploadDocumentFile={() => uploadfile()}
          loader={progressLoader}
          documentUploadStore={store}
        />
      );
    };

    const onInputChange = (params: ICellEditorParams, value: string): void => {
      gridState.setIsAllRowsSelected(true);
      const colId = params.column.getColId();
      switch (colId) {
        default:
          break;
      }
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    };

    const onDropDownChange = (colDef: ICellEditorParams, value): void => {
      gridState.setIsAllRowsSelected(true);
      const colId = colDef.column.getColId();
      switch (colId) {
        default:
          break;
      }
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    };

    const downloadA2GLocationFile = () => {
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.downloadA2GLocationFile(
          parseInt(params.id),
          useUpsert.getField('id').value,
          useUpsert.getField('locationDocUri').value
        )
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {})
        )
        .subscribe({
          next: (response: IAPIDownloadA2GALocationFile) => {
            // const url = window.URL.createObjectURL(new Blob([ documentUploadStore.file ]));
            UIStore.setPageLoader(false);
            const link = document.createElement('a');
            link.href = response.documentUri;
            link.target = '_blank';
            link.download = 'A2G Location PDF';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
          error: error => {
            AlertStore.info(`Error Downloading ${error.message}`);
          },
        });
    };

    const downloadA2GAgentFile = (data: LocationA2GAgentModel) => {
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.downloadA2GAgentFile(parseInt(params.id), data.id, data.profilePdfUri)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {})
        )
        .subscribe({
          next: (response: IAPIDownloadA2GAgentFile) => {
            // const url = window.URL.createObjectURL(new Blob([ documentUploadStore.file ]));
            UIStore.setPageLoader(false);
            const link = document.createElement('a');
            link.href = response.documentUri;
            link.target = '_blank';
            link.download = 'A2G Agent PDF';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
          error: error => {
            AlertStore.info(`Error Downloading ${error.message}`);
          },
        });
    };

    const columnDefs: ColDef[] = [
      {
        headerName: 'Agent Name',
        field: 'name',
        headerTooltip: 'Agent Name',
        minWidth: 130,
        cellEditorParams: {
          placeHolder: 'Agent Name',
          rules: 'required|max:200',
        },
      },
      {
        headerName: 'Agent Phone',
        field: 'phone',
        headerTooltip: 'Agent Phone',
        minWidth: 130,
        cellEditorParams: {
          placeHolder: 'Agent Phone',
          rules: 'string|max:30|regex:/^[\\d\\+\\(\\)\\.\\-\\s]*$/',
        },
      },
      {
        headerName: 'Agent Ext',
        field: 'phoneExt',
        headerTooltip: 'Agent Ext',
        minWidth: 130,
        cellEditorParams: {
          placeHolder: 'Agent Ext',
          rules: `string|max:6|regex:${regex.numberOnly}`,
        },
      },
      {
        headerName: 'Agent Email',
        field: 'email',
        headerTooltip: 'Agent Email',
        minWidth: 130,
        cellEditorParams: {
          placeHolder: 'Agent Email',
          rules: `string|max:200|regex:${regex.email}`,
        },
      },
      {
        headerName: 'Agent Profile',
        field: 'profilePdfUri',
        headerTooltip: 'Agent Profile',
        cellRenderer: 'viewRenderer',
        minWidth: 130,
        filter: false,
        editable: false,
        cellRendererParams: {
          getViewRenderer: (rowIndex: number, { data }: RowNode) => {
            return (
              <Grid container alignItems="center">
                <Grid sm={9}>
                  <Tooltip title={data?.profilePdfUri}>
                    <Typography
                      style={{ width: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {data?.profilePdfUri}
                    </Typography>
                  </Tooltip>
                </Grid>
                <Grid sm={3}>
                  {data.profilePdfUri && !gridState.isRowEditing ? (
                    <Button onClick={() => downloadA2GAgentFile(data)} disabled={Boolean(!data.id)}>
                      <DownloadIcon />
                    </Button>
                  ) : rowIndex === vendorLocationStore.index ? (
                    <Button
                      onClick={() =>
                        onRequestImportDocument(
                          'Upload A2G Agent File',
                          () => uploadAgentDocumentFile(),
                          vendorLocationStore
                        )
                      }
                      disabled={!gridState.isRowEditing}
                    >
                      <UploadIcon />
                    </Button>
                  ) : data.profilePdfUri ? (
                    <Button onClick={() => downloadA2GAgentFile(data)} disabled={Boolean(!data.id)}>
                      <DownloadIcon />
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        onRequestImportDocument(
                          'Upload A2G Agent File',
                          () => uploadAgentDocumentFile(),
                          vendorLocationStore
                        )
                      }
                      disabled={!gridState.isRowEditing}
                    >
                      <UploadIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            );
          },
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
        suppressSizeToFit: true,
        minWidth: 150,
        maxWidth: 150,
        cellStyle: { ...cellStyle() },
      },
    ];

    const cancelEditing = (rowIndex: number) => {
      agGrid.cancelEditing(rowIndex);
      agGrid.filtersApi.resetColumnFilters();
      gridState.setIsAllRowsSelected(false);
      vendorLocationStore.file = null;
      vendorLocationStore.a2gAgentFileUri = null;
      vendorLocationStore.documentUpdated = false;
    };

    const removeUnSavedRow = (rowIndex: number) => {
      const data = agGrid._getTableItem(rowIndex);
      if (!data?.id) {
        agGrid._removeTableItems([ data ]);
      }
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
              removeUnSavedRow(rowIndex);
            }}
          />
        );
      } else {
        cancelEditing(rowIndex);
        removeUnSavedRow(rowIndex);
      }
    };

    const btnDisable = () => {
      if (vendorLocationStore.documentUpdated) {
        if (gridState.hasError) {
          return true;
        } else {
          return false;
        }
      }
      return vendorLocationStore.documentUpdated;
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
          ],
          getDisabledState: () => btnDisable() || gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            switch (action) {
              case GRID_ACTIONS.EDIT:
                vendorLocationStore.documentUpdated = false;
                vendorLocationStore.index = rowIndex;
                const model = agGrid._getTableItem(rowIndex);
                vendorLocationStore.a2gAgentFileUri = model.profilePdfUri;
                agGrid._startEditingCell(rowIndex, 'name');
                break;
              case GRID_ACTIONS.SAVE:
                gridState.gridApi.stopEditing();
                const data = agGrid._getTableItem(rowIndex);
                data.profilePdfUri = vendorLocationStore.a2gAgentFileUri;
                gridState.gridApi.updateRowData({
                  addIndex: rowIndex,
                  update: [ data ],
                });
                vendorLocationStore.a2gAgentFileUri = null;
                vendorLocationStore.documentUpdated = false;
                vendorLocationStore.file = null;
                documentUploadStore.documentUpdated = true;
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
        pagination: false,
        suppressClickEdit: true,
        isExternalFilterPresent: () => false,
        onFilterChanged: () => loadVendorLocationData(),
        onSortChanged: e => {
          agGrid.filtersApi.onSortChanged(e);
          loadVendorLocationData();
        },
      };
    };

    const addLocationAgent = (): void => {
      const model = [ new LocationA2GAgentModel() ];
      agGrid.addNewItems(model, { startEditing: false, colKey: 'name' });
      gridState.setHasError(true);
      vendorLocationStore.index = 0;
    };

    return (
      <ConfirmNavigate isBlocker={formRef.changed || documentUploadStore?.documentUpdated || gridState.isRowEditing}>
        <DetailsEditorWrapper
          headerActions={headerActions()}
          isEditMode={isEditable()}
          classes={{ headerActions: classes.headerActions }}
        >
          <div className={classes.editorWrapperContainer}>
            <ViewInputControls
              isEditable={isEditable()}
              groupInputControls={groupInputControls()}
              onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
              onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
              field={fieldKey => useUpsert.getField(fieldKey)}
              onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
              onFocus={fieldKey => onFocus(fieldKey)}
            />
            <CollapsibleWithButton
              title="UA Agents"
              buttonText="Add Agent"
              isButtonDisabled={
                gridState.isProcessing || gridState.isRowEditing || !isEditable() || UIStore.pageLoading
              }
              onButtonClick={() => addLocationAgent()}
              titleVariant="h6"
            >
              <CustomAgGridReact
                isRowEditing={gridState.isRowEditing}
                rowData={gridState.data}
                gridOptions={gridOptions()}
                serverPagination={false}
                paginationData={gridState.pagination}
                classes={{ customHeight: classes.customHeight }}
                disablePagination={gridState.isRowEditing || gridState.isProcessing}
                hidePagination={true}
              />
            </CollapsibleWithButton>
          </div>
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
);
export default inject('settingsStore', 'vendorLocationStore', 'documentUploadStore', 'contactMasterStore')(LocationA2G);

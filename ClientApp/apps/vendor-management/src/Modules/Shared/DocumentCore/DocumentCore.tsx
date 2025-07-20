import React, { FC, useEffect, ReactNode } from 'react';
import { CustomAgGridReact, useAgGrid, useGridState, AgGridMasterDetails } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ICellEditorParams, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VendorManagmentModel, StatusBaseModel, useVMSModuleSecurity } from '../../../Modules/Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import {
  IAPIGridRequest,
  Utilities,
  GRID_ACTIONS,
  IClasses,
  cellStyle,
  SelectOption,
  Loader,
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
} from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { BaseStore, DocumentUploadStore, SettingsStore, VendorManagementStore } from '../../../Stores';
import { addressGridFilters } from '../../VendorSettings/Fields';
import { inject, observer } from 'mobx-react';
import { withStyles, Button, Typography } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { styles } from './DocumentCore.style';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { UploadIcon, DownloadIcon } from '@uvgo-shared/icons';
import { DocumentUploadModel } from '../Models/DocumentUpload.model';
import UploadDocumentFile from '../Components/UploadDocumentFile/UploadDocumentFile';
import { COLLECTION_NAMES } from '../Enums/CollectionName.enum';
import { finalize, takeUntil } from 'rxjs/operators';
import { IAPIDocumentFile, IAPIDownloadDocumentFile } from '../Interfaces/Request/API-Request-DocumentUpload.interface';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';
import moment from 'moment';
import CustomTooltip from '../Components/Tooltip/CustomTooltip';
import { VALIDATION_REGEX } from '../Enums/Spacing.enum';


interface Props {
  settingsStore?: SettingsStore;
  vendorManagementStore: VendorManagementStore;
  documentUploadStore: DocumentUploadStore;
  onSave: (rowIndex: number) => void;
  classes: IClasses;
  backNavLink: string;
  backNavTitle: string;
  loadInitialData: (pageRequest?: IAPIGridRequest) => void;
  headerName: string;
  uploadDocumentFile: () => void;
  selectedVendor?: VendorManagmentModel;
  loader: Loader;
  isVendor: boolean;
  agGrid: any;
  gridState?: any;
  deleteDocument: (rowIndex: number) => void;
}

const DocumentCore: FC<Props> = ({
  settingsStore,
  vendorManagementStore,
  documentUploadStore,
  onSave,
  classes,
  backNavLink,
  backNavTitle,
  loadInitialData,
  headerName,
  uploadDocumentFile,
  selectedVendor,
  loader,
  isVendor,
  agGrid,
  gridState,
  deleteDocument,
}) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  useEffect(() => {
    vendorManagementStore.getVmsCountryCode().subscribe();
    loadInitialData();
  }, []);

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    const colId = params.column.getColId();
    switch (colId) {
      case 'otherName':
        agGrid.fetchCellInstance('otherName')?.setRules(`required|string|between:2,256|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`);
        break;
      case 'startDate':
        const startDate = moment(value);
        const endDateCol = agGrid.fetchCellInstance('endDate');
        const endDate = moment(endDateCol.getValue());
        if (startDate.isSameOrAfter(endDate, 'day')) {
          endDateCol.setValue(null);
        }
        break;
      case 'endDate':
        const startCol = agGrid.fetchCellInstance('startDate');
        const startDatee = moment(startCol.getValue());
        const endDatee = moment(value);

        if (endDatee.isSameOrBefore(startDatee, 'day')) {
          BaseStore.showAlert('End Date cannot be less than or equal to Start Date', 0);
          agGrid.fetchCellInstance('endDate').setValue(null);
        } else if (startDatee.isSameOrAfter(endDatee, 'day')) {
          BaseStore.showAlert('Start Date cannot be greater than or equal to End Date', 0);
          agGrid.fetchCellInstance('startDate').setValue(null);
        }
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = params.column.getColId();
    if (colId == 'name') {
      agGrid.fetchCellInstance('otherName').setValue('');
      if (value?.name.toLocaleLowerCase() === 'other') {
        documentUploadStore.isOtherName = true;
        agGrid.fetchCellInstance('otherName')?.setRules(`required|string|between:2,256|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`);
      } else {
        documentUploadStore.isOtherName = false;
        agGrid.fetchCellInstance('otherName')?.setRules('');
      }
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const saveRowData = (rowIndex: number) => {
    gridState.gridApi.stopEditing();
    onSave(rowIndex);
    gridState.setIsAllRowsSelected(false);
  };

  const addNewGrid = () => {
    vendorManagementStore.isCellDisable = true;
    const model: DocumentUploadModel = new DocumentUploadModel({
      vendor: selectedVendor,
      status: StatusBaseModel.deserialize({
        id: 1,
        name: settingsStore?.vendorDocumentStatus[0].name,
      }),
    });
    documentUploadStore.index = 0;
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const colDef: ColDef[] = [
    {
      headerName: 'Name',
      minWidth: 150,
      field: 'name',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Name',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Document Name',
        valueGetter: (selectedOptions: SelectOption) => selectedOptions.value,
        rules: 'required',
        onSearch: () => settingsStore?.vendorDocumentName,
        getAutoCompleteOptions: () => settingsStore?.vendorDocumentName,
      },
    },
    {
      headerName: 'Other Name',
      minWidth: 150,
      field: 'otherName',
      headerTooltip: 'Other Name',
      cellEditorParams: {
        placeHolder: 'Other Name',
        ignoreNumber: true,
        getDisableState: ({ data }) => !Boolean(documentUploadStore.isOtherName),
        isRequired: ({ data }) => Boolean(documentUploadStore.isOtherName),
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
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => settingsStore?.vendorDocumentStatus,
        valueGetter: (option: SelectOption) => option.value,
        rules: 'required',
      },
    },
    {
      headerName: 'Document',
      field: 'documentUri',
      cellRenderer: 'viewRenderer',
      minWidth: 110,
      maxWidth: 150,
      filter: false,
      editable: false,
      headerTooltip: 'Document',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => {
          if (data.documentUri && !gridState.isRowEditing) {
            return (
              <Button onClick={() => downloadFile(data)}>
                <DownloadIcon />
              </Button>
            );
          } else if (rowIndex === documentUploadStore.index) {
            return (
              <Button onClick={() => onRequestImportDocument()}>
                <UploadIcon />
              </Button>
            );
          } else
            return (
              <Button onClick={() => downloadFile(data)}>
                <DownloadIcon />
              </Button>
            );
        },
      },
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      headerTooltip: 'Start Date',
      minWidth: 130,
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Start Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        rules: 'required',
      },
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      headerTooltip: 'End Date',
      minWidth: 130,
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'End Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
      cellEditorParams: {
        placeHolder: 'End Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
      },
    },
    {
      headerName: 'Comments',
      minWidth: 150,
      field: 'comment',
      headerTooltip: 'Comments',
      cellEditorParams: {
        placeHolder: 'Comments',
        ignoreNumber: true,
        rules: `string|between:2,300|regex:${VALIDATION_REGEX.TWO_WHITESPACE_STRING}`,
      },
    },
    {
      headerName: 'Is Restricted',
      minWidth: 100,
      field: 'isRestricted',
      headerTooltip: 'Is Restricted',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Last Updated',
      minWidth: 150,
      field: 'lastUpdated',
      headerTooltip: 'Last Updated',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Last Updated',
        ignoreNumber: true,
        rules: 'string|between:2,200',
        getDisableState: (node: RowNode) => true,
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
      hide: !vmsModuleSecurityV2.isEditable,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const downloadFile = (data: DocumentUploadModel) => {
    documentUploadStore
      ?.downloadDocumentFile(
        isVendor ? COLLECTION_NAMES.VENDOR_DOCUMENT : COLLECTION_NAMES.VENDOR_LOCATION_DOCUMENT,
        data.documentUri,
        data.id,
        isVendor ? parseInt(params.vendorId) : parseInt(params.id)
      )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => { })
      )
      .subscribe({
        next: (response: IAPIDownloadDocumentFile) => {
          // const url = window.URL.createObjectURL(new Blob([ documentUploadStore.file ]));
          const link = document.createElement('a');
          link.href = response.documentUri;
          link.target = '_blank';
          if (data.otherName !== null) {
            link.download = data.otherName;
          } else {
            link.download = data.name.name;
          }
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: error => {
          AlertStore.info(`Error Downloading ${error.message}`);
        },
      });
  };

  const btnDisable = () => {
    if (documentUploadStore.documentUpdated) {
      if (gridState.hasError) {
        return true;
      } else {
        return false;
      }
    }
    return documentUploadStore.documentUpdated;
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs: colDef,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: true,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            isHidden: !vmsModuleSecurityV2.isEditable,
          },
          {
            title: 'Delete',
            action: GRID_ACTIONS.DELETE,
            isHidden: !vmsModuleSecurityV2.isEditable,
          },
        ],
        getDisabledState: () => btnDisable() || gridState.hasError || !Boolean(documentUploadStore.documentUri),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              documentUploadStore.index = rowIndex;
              const model = agGrid._getTableItem(rowIndex);
              agGrid._startEditingCell(rowIndex, 'name');
              documentUploadStore.documentUri = model.documentUri;
              if (model.name.name !== 'Other') {
                documentUploadStore.isOtherName = false;
              } else {
                documentUploadStore.isOtherName = true;
              }
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.DELETE:
              confirmRemove(rowIndex);
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
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      suppressScrollOnNewData: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={headerName} />}
        backNavTitle={backNavTitle}
        hideActionButtons={false}
        backNavLink={backNavLink}
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const dialogContent = () => {
    return (
      <PrimaryButton variant="contained" color="primary" onClick={() => ModalStore.close()}>
        Cancel
      </PrimaryButton>
    );
  };
  const confirmRemove = (rowIndex: number): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this record?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          deleteDocument(rowIndex);
          ModalStore.close();
        }}
      />
    );
  };

  const getConfirmation = (rowIndex: number): void => {
    if (gridState.isAllRowsSelected || documentUploadStore.documentUpdated) {
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

  const onRequestImportDocument = (): void => {
    ModalStore.open(
      <UploadDocumentFile
        fileType=".doc, .docx, .pdf, .jpg, .jpeg, .png, .xls, .xlsx, .ppt, .pptx"
        title="Upload Document File"
        uploadDocumentFile={() => uploadDocumentFile()}
        loader={loader}
        documentUploadStore={documentUploadStore}
      />
    );
  };

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
    vendorManagementStore.isCellDisable = false;
    documentUploadStore.file = null;
    documentUploadStore.documentUri = null;
    documentUploadStore.documentUpdated = false;
  };

  const removeUnSavedRow = (rowIndex: number) => {
    const data = agGrid._getTableItem(rowIndex);
    if (!data?.id) {
      const model = agGrid._getTableItem(rowIndex);
      agGrid._removeTableItems([ model ]);
    }
  };

  return (
    <>
      <ConfirmNavigate isBlocker={gridState.isRowEditing}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
          <AgGridMasterDetails
            addButtonTitle={'Add Document'}
            onAddButtonClick={() => addNewGrid()}
            hasAddPermission={vmsModuleSecurityV2.isEditable}
            disabled={gridState.isProcessing || gridState.isRowEditing}
            resetHeight={true}
            isPrimaryBtn={true}
          >
            <CustomAgGridReact
              isRowEditing={gridState.isRowEditing}
              rowData={gridState.data}
              gridOptions={gridOptions()}
              serverPagination={true}
              paginationData={gridState.pagination}
              onPaginationChange={loadInitialData}
              disablePagination={gridState.isRowEditing}
            />
          </AgGridMasterDetails>
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    </>
  );
};
export default inject(
  'settingsStore',
  'vendorManagementStore',
  'documentUploadStore',
  'vendorLocationStore'
)(withStyles(styles)(observer(DocumentCore)));

import React, { FC, useEffect, useState } from 'react';
import { SETTING_ID, SettingBaseModel, VENDOR_ADDRESS_DATA_FILTER, VendorManagmentModel } from '../../../Shared';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, Loader, UIStore, Utilities } from '@wings-shared/core';
import { BaseStore, SettingsStore, VendorManagementStore, DocumentUploadStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router';
import { forkJoin } from 'rxjs';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';
import DocumentCore from '../../../Shared/DocumentCore/DocumentCore';
import { IAPIResponseDocumentUpload } from '../../../Shared/Interfaces/Response/API-Response-DocumentUpload';
import { DocumentUploadModel } from '../../../Shared/Models/DocumentUpload.model';
import { VIEW_MODE } from '@wings/shared';
import { IAPIDocumentFile } from '../../../Shared/Interfaces/Request/API-Request-DocumentUpload.interface';
import {
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { addressGridFilters } from '../../../VendorSettings/Fields';

interface Props {
  vendorManagementStore: VendorManagementStore;
  settingsStore: SettingsStore;
  params?: { id: number; vendorId: number };
  documentUploadStore: DocumentUploadStore;
  viewMode: VIEW_MODE;
  vendorId: number;
}

const VendorDocument: FC<Props> = ({ vendorManagementStore, settingsStore, documentUploadStore }) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const [ selectedVendor, setSelectedVendor ] = useState(new VendorManagmentModel());
  const progressLoader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, DocumentUploadModel>(addressGridFilters, gridState);

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = () => {
    UIStore.setPageLoader(true);
    vendorManagementStore
      ?.getVendorById(parseInt(params.vendorId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorManagmentModel) => {
        setSelectedVendor(response);
      });
  };

  const uploadDocumentFile = (): void => {
    UIStore.setPageLoader(true);
    progressLoader.setLoadingState(true);
    documentUploadStore
      ?.importDocumentFile(COLLECTION_NAMES.VENDOR_DOCUMENT, documentUploadStore.file[0], params.vendorId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          progressLoader.setLoadingState(false);
        })
      )
      .subscribe({
        next: (response: IAPIDocumentFile) => {
          if (response) {
            documentUploadStore.documentUpdated=true;
            gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
            documentUploadStore.documentUri = response.results;
            AlertStore.info('Vendor Document File imported successfully');
            ModalStore.close();
          }
        },
        error: error => {
          AlertStore.info(`Records imported with errors ${error.message}`);
        },
      });
  };

  const upsertDocument = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    documentUploadStore
      ?.upsertDocument(
        COLLECTION_NAMES.VENDOR_DOCUMENT,
        model.serialize(documentUploadStore.documentUri, parseInt(params.vendorId), 0)
      )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
          documentUploadStore.documentUpdated=false
        })
      )
      .subscribe({
        next: (response: DocumentUploadModel) => {
          agGrid._updateTableItem(rowIndex, response);
          documentUploadStore.file = null;
          documentUploadStore.documentUri = null;
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const deleteDocument = (rowIndex: number): void => {
    const model: DocumentUploadModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    documentUploadStore
      .removeDocument(model.id, COLLECTION_NAMES.VENDOR_DOCUMENT)
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
          loadInitialData()
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Vendor.Id',
          propertyValue: params.vendorId,
        },
      ]),
    };
    const vendorRequest: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };

    forkJoin([
      documentUploadStore.getDocumentUpload(COLLECTION_NAMES.VENDOR_DOCUMENT, request),
      settingsStore.getSettings( SETTING_ID.SETTING_DOCUMENT_STATUS, 'DocumentStatus'),
      settingsStore.getSettings( SETTING_ID.SETTING_DOCUMENT_NAME, 'DocumentName'),
      vendorManagementStore.getVMSComparison(vendorRequest),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIResponseDocumentUpload>, SettingBaseModel]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = DocumentUploadModel.deserializeList(response[0].results);
        gridState.setGridData(results);
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  return (
    <DocumentCore
      loadInitialData={(pageRequest) => loadInitialData(pageRequest)}
      onSave={(rowIndex) => upsertDocument(rowIndex)}
      settingsStore={settingsStore}
      vendorManagementStore={vendorManagementStore}
      backNavLink={'/vendor-management'}
      uploadDocumentFile={() => uploadDocumentFile()}
      backNavTitle="Vendors"
      headerName={`${selectedVendor.name} (${selectedVendor.code})`}
      loader={progressLoader}
      selectedVendor={selectedVendor}
      isVendor={true}
      agGrid={agGrid}
      gridState={gridState}
      deleteDocument={(rowIndex) => deleteDocument(rowIndex)}
    />
  );
};
export default inject('vendorManagementStore', 'settingsStore', 'documentUploadStore')(observer(VendorDocument));

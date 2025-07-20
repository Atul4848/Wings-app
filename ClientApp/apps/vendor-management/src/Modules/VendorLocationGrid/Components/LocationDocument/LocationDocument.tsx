import React, { FC, useEffect, useState } from 'react';
import { SETTING_ID, SettingBaseModel, VENDOR_ADDRESS_DATA_FILTER, VendorLocationModel } from '../../../Shared';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, Loader, UIStore, Utilities } from '@wings-shared/core';
import {
  BaseStore,
  SettingsStore,
  VendorLocationStore,
  VendorManagementStore,
  DocumentUploadStore,
} from '../../../../Stores';
import { AlertStore } from '@uvgo-shared/alert';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { useParams } from 'react-router';
import { forkJoin } from 'rxjs';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';
import DocumentCore from '../../../Shared/DocumentCore/DocumentCore';
import { IAPIResponseDocumentUpload } from '../../../Shared/Interfaces/Response/API-Response-DocumentUpload';
import { DocumentUploadModel } from '../../../Shared/Models/DocumentUpload.model';
import { IAPIDocumentFile } from '../../../Shared/Interfaces/Request/API-Request-DocumentUpload.interface';
import {
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { addressGridFilters } from '../../../VendorSettings/Fields';

interface Props {
  vendorLocationStore: VendorLocationStore;
  vendorManagementStore: VendorManagementStore;
  settingsStore: SettingsStore;
  params?: { id: number; vendorId: number };
  documentUploadStore: DocumentUploadStore;
}

const LocationDocument: FC<Props> = ({
  vendorManagementStore,
  vendorLocationStore,
  settingsStore,
  documentUploadStore,
}) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
  const progressLoader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, DocumentUploadModel>(addressGridFilters, gridState);

  useEffect(() => {
    loadVendorLocationData();
  }, []);

  const loadVendorLocationData = () => {
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.getVendorLocationById(parseInt(params.id))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorLocationModel) => {
        setSelectedVendorLocation(response);
      });
  };

  const upsertAddDocument = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    documentUploadStore
      ?.upsertDocument(
        COLLECTION_NAMES.VENDOR_LOCATION_DOCUMENT,
        model.serialize(documentUploadStore.documentUri, 0, parseInt(params.id))
      )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
          documentUploadStore.documentUpdated=false;
        })
      )
      .subscribe({
        next: (response: DocumentUploadModel) => {
          agGrid._updateTableItem(rowIndex, response);
          documentUploadStore.file=null;
          documentUploadStore.documentUri=null;
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const uploadDocumentFile = (): void => {
    UIStore.setPageLoader(true);
    progressLoader.setLoadingState(true);
    documentUploadStore
      ?.importDocumentFile(COLLECTION_NAMES.VENDOR_LOCATION_DOCUMENT, documentUploadStore.file[0], params.id)
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
            documentUploadStore.documentUri = response.results;
            documentUploadStore.documentUpdated=true;
            gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
            AlertStore.info('Vendor Location Document File imported successfully');
            ModalStore.close();
          }
        },
        error: error => {
          AlertStore.info(`Records imported with errors ${error.message}`);
        },
      });
  };

  const deleteDocument = (rowIndex: number): void => {
    const model: DocumentUploadModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    documentUploadStore
      .removeDocument(model.id)
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
      filterCollection: JSON.stringify([
        {
          propertyName: 'VendorLocation.VendorLocationId',
          propertyValue: params.id,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };

    forkJoin([
      documentUploadStore.getDocumentUpload(COLLECTION_NAMES.VENDOR_LOCATION_DOCUMENT, request),
      settingsStore.getSettings( SETTING_ID.SETTING_DOCUMENT_STATUS, 'DocumentStatus'),
      settingsStore.getSettings( SETTING_ID.SETTING_DOCUMENT_NAME, 'DocumentName'),
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
      onSave={(rowIndex) => upsertAddDocument(rowIndex)}
      uploadDocumentFile={() => uploadDocumentFile()}
      settingsStore={settingsStore}
      vendorManagementStore={vendorManagementStore}
      documentUploadStore={documentUploadStore}
      backNavLink={
        params.operationCode === 'upsert'
          ? '/vendor-management/vendor-location'
          : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`
      }
      backNavTitle="Vendor Location"
      loader={progressLoader}
      headerName={selectedVendorLocation.label}
      isVendor={false}
      agGrid={agGrid}
      gridState={gridState}
      deleteDocument={(rowIndex) => deleteDocument(rowIndex)}
    />
  );
};
export default inject(
  'vendorManagementStore',
  'vendorLocationStore',
  'settingsStore',
  'documentUploadStore'
)(observer(LocationDocument));

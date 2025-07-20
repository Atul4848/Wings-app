import React, { FC, useEffect, useState } from 'react';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, UIStore } from '@wings-shared/core';
import { 
  BaseStore, 
  VendorLocationStore, 
  VendorManagementStore, 
  BankInformationStore 
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import BankInformationCore from '../../../Shared/BankInformationCore/BankInformationCore'
import { VIEW_MODE } from '@wings/shared';
import { forkJoin } from 'rxjs';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';
import { SETTING_ID, SettingBaseModel, VENDOR_ADDRESS_DATA_FILTER, VendorLocationModel } from '../../../Shared';
import { useParams } from 'react-router';
import { addressGridFilters } from '../../../VendorSettings/Fields';
import {
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { IAPIResponseVendorAddress } from '../../../Shared/Interfaces/Response/API-Response-VendorAddress';
import { BankInformation as BankInformationModel } from '../../../Shared/Models/BankInformation.model';

interface Props {
  vendorManagementStore: VendorManagementStore;
  vendorLocationStore: VendorLocationStore;
  bankInformationStore: BankInformationStore;
  viewMode: VIEW_MODE;
  params?: { id: number; vendorId: number };
}

const LocationBankInformation: FC<Props> = ({ 
  vendorManagementStore, 
  vendorLocationStore, 
  bankInformationStore, 
}) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const params = useParams();

  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, BankInformationModel>(addressGridFilters, gridState);
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());

  useEffect(()=>{
    loadVendorLocationData()
  },[])

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

  const errorHandler = (errors: object, id): void => {
    Object.values(errors)?.forEach(errorMessage => BaseStore.showAlert(errorMessage[0], id));
  };

  const upsertVendorLocationBankInformation = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    bankInformationStore
      ?.upsertVendorLocationBankInformation(model.serialize(params.vendorId, params.id))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: BankInformationModel) => {
          agGrid._updateTableItem(rowIndex, response);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          if (error.response.data.errors) {
            errorHandler(error.response.data.errors, model.id.toString());
            return;
          }
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
    };
    const bankInformationRequest: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Id',
          propertyValue: params.id,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    forkJoin([
      bankInformationStore?.getVendorBankInformation(bankInformationRequest, COLLECTION_NAMES.VENDLOR_LOCATION),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false)
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIResponseVendorAddress>, SettingBaseModel]) => {
        response[0].totalNumberOfRecords=response[0].results.length
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = BankInformationModel.deserializeList(response[0].results);
        gridState.setGridData(results);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  return (
    <BankInformationCore
      rightContentActionText="Add Bank Information"
      loadInitialData={(pageRequest) => loadInitialData(pageRequest)}
      onSave={(rowIndex) => upsertVendorLocationBankInformation(rowIndex)}
      vendorManagementStore={vendorManagementStore}
      backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
      backNavTitle="Vendor Location"
      headerName={selectedVendorLocation.label}
      agGrid={agGrid}
      gridState={gridState}
    />
  );
};
export default inject(
  'vendorManagementStore', 
  'vendorLocationStore', 
  'bankInformationStore', 
)(observer(LocationBankInformation));

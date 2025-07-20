import React, { FC, useEffect, useState } from 'react';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, UIStore } from '@wings-shared/core';
import { 
  BaseStore, 
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
import { SETTING_ID, SettingBaseModel, VENDOR_ADDRESS_DATA_FILTER, VendorManagmentModel } from '../../../Shared';

import { addressGridFilters } from '../../../VendorSettings/Fields';
import {
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { IAPIResponseVendorAddress } from '../../../Shared/Interfaces/Response/API-Response-VendorAddress';
import { BankInformation as BankInformationModel } from '../../../Shared/Models/BankInformation.model';

interface Props {
  vendorManagementStore: VendorManagementStore;
  bankInformationStore: BankInformationStore;
  viewMode: VIEW_MODE;
  vendorId: number;
}

const BankInformation: FC<Props> = ({ 
  vendorManagementStore, 
  bankInformationStore, 
  vendorId
}) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();

  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, BankInformationModel>(addressGridFilters, gridState);
  const [ selectedVendor, setSelectedVendor ] = useState(new VendorManagmentModel());

  useEffect(()=>{
    loadVendorData()
  },[ vendorId ])

  const loadVendorData = () => {
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

  const upsertBankInformation = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    bankInformationStore
      ?.upsertBankInformation(model.serialize(vendorId, 0))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
          agGrid.filtersApi.resetColumnFilters();
        })
      )
      .subscribe({
        next: (response: BankInformationModel) => {
          agGrid._updateTableItem(rowIndex, response);
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
    };
    const bankInformationRequest: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Id',
          propertyValue: vendorId,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    forkJoin([
      bankInformationStore?.getVendorBankInformation(bankInformationRequest, COLLECTION_NAMES.VENDOR),
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
      onSave={(rowIndex) => upsertBankInformation(rowIndex)}
      vendorManagementStore={vendorManagementStore}
      backNavLink="/vendor-management"
      backNavTitle="Vendors"
      headerName={selectedVendor.label}
      agGrid={agGrid}
      gridState={gridState}
    />
  );
};
export default inject(
  'vendorManagementStore', 
  'bankInformationStore', 
)(observer(BankInformation));

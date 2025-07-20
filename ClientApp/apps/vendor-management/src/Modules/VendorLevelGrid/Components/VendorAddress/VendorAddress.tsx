import React, { FC, useEffect, useState } from 'react';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, UIStore } from '@wings-shared/core';
import { BaseStore, SettingsStore, VendorLocationStore, VendorManagementStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import AddressCore from '../../../Shared/AddressCore/AddressCore';
import { VIEW_MODE } from '@wings/shared';
import { VendorLocationAddressModel } from '../../../Shared/Models/VendorLocationAddress.model';
import { forkJoin } from 'rxjs';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';
import { SETTING_ID, SettingBaseModel, VENDOR_ADDRESS_DATA_FILTER, VendorManagmentModel } from '../../../Shared';

import { addressGridFilters } from '../../../VendorSettings/Fields';
import {
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { IAPIResponseVendorAddress } from '../../../Shared/Interfaces/Response/API-Response-VendorAddress';

interface Props {
  vendorManagementStore: VendorManagementStore;
  vendorLocationStore: VendorLocationStore;
  settingsStore: SettingsStore;
  viewMode: VIEW_MODE;
  vendorId: number;
}

const VendorAddress: FC<Props> = ({ vendorManagementStore, vendorLocationStore, vendorId, settingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();

  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, VendorLocationAddressModel>(addressGridFilters, gridState);
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

  const upsertVendorAddress = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    vendorManagementStore
      ?.upsertVendorAddress(model.serialize(vendorId, 0))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: VendorLocationAddressModel) => {
          agGrid._updateTableItem(rowIndex, response);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'addressType');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const deleteAddress = (rowIndex: number): void => {
    const model: VendorLocationAddressModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    vendorManagementStore
      .removVendorAddress(model.id)
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
          loadInitialData();
          agGrid.filtersApi.resetColumnFilters()
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'addressType');
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
    const addressRequest: IAPIGridRequest = {
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
      //vendorLocationStore.getVMSLocationAddresses(addressRequest, COLLECTION_NAMES.VENDOR_ADDRESS),
      vendorManagementStore?.getVMSAddressComparison(addressRequest),
      settingsStore?.getSettings( SETTING_ID.SETTING_ADDRESS_TYPE, COLLECTION_NAMES.ADDRESS_TYPE,request),
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
        const results = VendorLocationAddressModel.deserializeList(response[0].results);
        gridState.setGridData(results);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  return (
    <AddressCore
      rightContentActionText="Add Address"
      loadInitialData={(pageRequest) => loadInitialData(pageRequest)}
      onSave={(rowIndex) => upsertVendorAddress(rowIndex)}
      settingsStore={settingsStore}
      vendorManagementStore={vendorManagementStore}
      backNavLink="/vendor-management"
      backNavTitle="Vendors"
      deleteAddress={(rowIndex) => deleteAddress(rowIndex)}
      headerName={selectedVendor.label}
      agGrid={agGrid}
      gridState={gridState}
    />
  );
};
export default inject('vendorManagementStore', 'vendorLocationStore', 'settingsStore')(observer(VendorAddress));

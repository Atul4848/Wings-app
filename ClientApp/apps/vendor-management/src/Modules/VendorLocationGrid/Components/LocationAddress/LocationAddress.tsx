import React, { FC, useEffect, useState } from 'react';
import { SETTING_ID, SettingBaseModel, VENDOR_ADDRESS_DATA_FILTER, VendorLocationModel } from '../../../Shared';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, UIStore } from '@wings-shared/core';
import { BaseStore, SettingsStore, VendorLocationStore, VendorManagementStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import AddressCore from '../../../Shared/AddressCore/AddressCore';
import { VendorLocationAddressModel } from '../../../Shared/Models/VendorLocationAddress.model';
import { useParams } from 'react-router';
import { forkJoin } from 'rxjs';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';
import { IAPIResponseVendorLocationAddress } from 
  '../../../Shared/Interfaces/Response/API-Response-VendorLocationAddress';
import { useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { addressGridFilters } from '../../../VendorSettings/Fields';

interface Props {
  vendorLocationStore: VendorLocationStore;
  vendorManagementStore: VendorManagementStore;
  settingsStore: SettingsStore;
  params?: { id: number; vendorId: number };
}

const LocationAddress: FC<Props> = ({ vendorManagementStore, vendorLocationStore, settingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, VendorLocationAddressModel>(addressGridFilters, gridState);
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());

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

  const errorHandler = (errors: object, id): void => {
    Object.values(errors)?.forEach(errorMessage => BaseStore.showAlert(errorMessage[0], id));
  };

  const upsertVendorLocationAddress = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.upsertVendorLocationAddress(model.serialize(params.vendorId, params.id))
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
          if (error.response.data.errors) {
            errorHandler(error.response.data.errors, model.id.toString());
            return;
          }
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const deleteAddress = (rowIndex: number): void => {
    const model: VendorLocationAddressModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    vendorLocationStore
      .removVendorLocationAddress(model.id)
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
          loadInitialData({}, agGrid, gridState)
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
          propertyName: 'VendorLocation.VendorLocationId',
          propertyValue: params.id,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    forkJoin([
      vendorLocationStore.getVMSLocationAddresses(addressRequest, COLLECTION_NAMES.VENDOR_LOCATION_ADDRESS),
      settingsStore?.getSettings( SETTING_ID.SETTING_ADDRESS_TYPE, COLLECTION_NAMES.ADDRESS_TYPE,request),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIResponseVendorLocationAddress>, SettingBaseModel]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = VendorLocationAddressModel.deserializeList(response[0].results);
        gridState.setGridData(results);
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  return (
    <AddressCore
      rightContentActionText="Add Address"
      loadInitialData={(pageRequest) => loadInitialData(pageRequest)}
      onSave={(rowIndex) => upsertVendorLocationAddress(rowIndex)}
      settingsStore={settingsStore}
      vendorManagementStore={vendorManagementStore}
      backNavLink={
        params.operationCode === 'upsert'
          ? '/vendor-management/vendor-location'
          : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`
      }
      backNavTitle="Vendor Location"
      deleteAddress={(rowIndex) => deleteAddress(rowIndex)}
      headerName={selectedVendorLocation.label}
      agGrid={agGrid}
      gridState={gridState}
    />
  );
};
export default inject('vendorManagementStore', 'vendorLocationStore', 'settingsStore')(observer(LocationAddress));

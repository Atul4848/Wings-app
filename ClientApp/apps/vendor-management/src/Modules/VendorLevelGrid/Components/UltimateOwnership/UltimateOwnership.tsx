import React, { FC, useState } from 'react';
import { GridPagination, IAPIGridRequest, IAPIPageResponse, UIStore } from '@wings-shared/core';
import {
  BaseStore,
  UltimateOwnershipStore,
  VendorManagementStore
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { VIEW_MODE } from '@wings/shared';
import { forkJoin } from 'rxjs';
import { SettingBaseModel, UltimateOwnershipModel, VendorManagmentModel } from '../../../Shared';

import {
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import UltimateOwnershipCore from '../../../Shared/UltimateOwnershipCore/UltimateOwnershipCore';
import { IAPIResponseOwnership } from '../../../Shared/Interfaces/Response/API-Response-Ownership';
import { COLLECTION_NAMES } from '../../../Shared/Enums/CollectionName.enum';

interface Props {
  ultimateOwnershipStore: UltimateOwnershipStore;
  vendorManagementStore: VendorManagementStore;
  viewMode: VIEW_MODE;
  vendorId: number;
  hasOwnership: boolean;
}

const UltimateOwnership: FC<Props> = ({
  vendorId,
  ultimateOwnershipStore,
  vendorManagementStore,
}) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();

  const agGrid = useAgGrid<[], UltimateOwnershipModel>([], gridState);
  const [ selectedVendor, setSelectedVendor ] = useState(new UltimateOwnershipModel());

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

  const upsertVendorOwner = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ultimateOwnershipStore
      ?.upsertVendorOwner([ model.serialize(vendorId, 0) ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: UltimateOwnershipModel) => {
          response = UltimateOwnershipModel.deserialize(response);
          agGrid._updateTableItem(rowIndex, response);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    ultimateOwnershipStore.isUboChecked = false;
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    const ownershipRequest: IAPIGridRequest = {
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
      ultimateOwnershipStore?.getVendorOwner(ownershipRequest, COLLECTION_NAMES.VENDOR),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false)
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIResponseOwnership>, SettingBaseModel]) => {
        response[0].totalNumberOfRecords = response[0].results.length
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = UltimateOwnershipModel.deserializeList(response[0].results);
        const hasUboRefused = results.some(item => item.isUBORefused === true);
        ultimateOwnershipStore.isUboChecked = hasUboRefused;
        gridState.setGridData(results);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };
  
  const updateUBORefusedData = (): void => {
    const model = new UltimateOwnershipModel();
    UIStore.setPageLoader(true);
    ultimateOwnershipStore
      ?.upsertVendorOwner(model.serializeList(vendorId, 0, ultimateOwnershipStore.vendorOwner,
        ultimateOwnershipStore.isUboChecked))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: UltimateOwnershipModel) => {
        },
        error: error => {
          BaseStore.showAlert(error.message, 0);
        },
      });
  };

  return (
    <UltimateOwnershipCore
      rightContentActionText="Add Owner"
      loadInitialData={(pageRequest) => loadInitialData(pageRequest)}
      loadVendorData={() => loadVendorData()}
      onSave={(rowIndex) => upsertVendorOwner(rowIndex)}
      updateUBORefusedData={() => updateUBORefusedData()}
      ultimateOwnershipStore={ultimateOwnershipStore}
      backNavLink="/vendor-management"
      backNavTitle="Vendors"
      headerName={selectedVendor.label}
      agGrid={agGrid}
      gridState={gridState}
    />
  );
};
export default inject(
  'ultimateOwnershipStore', 'vendorManagementStore'
)(observer(UltimateOwnership));

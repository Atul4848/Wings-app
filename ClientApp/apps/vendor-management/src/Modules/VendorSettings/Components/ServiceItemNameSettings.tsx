import React, { FC } from 'react';
import { agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef } from 'ag-grid-community';
import { ServiceItemModel, SERVICE_ITEM_COMPARISON_FILTERS, SETTING_ID, VmsModuleSecurity } from '../../Shared';
import { SelectOption, UIStore, Utilities, cellStyle } from '@wings-shared/core';
import { BaseStore, SettingsStore } from '../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { gridFilters } from '../Fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import SettingCore from '../../Shared/SettingCoreShared/SettingCore';
import { apiUrls } from '../../../Stores/API.url';
import { SettingNamesMapper } from '../../../Stores/SettingsMapper';

interface Props {
  settingsStore?:SettingsStore
}

const ServiceItemNameSettings: FC<Props> = ({ settingsStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<SERVICE_ITEM_COMPARISON_FILTERS, ServiceItemModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  
  const columnDefs: ColDef[] = [
    {
      headerName: 'Service Category',
      field: 'serviceCategory',
      minWidth: 295,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => serviceCategoryValueFormatter(value),
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Service Category',
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.vendorSettingsServiceCategory,
        onSearch: (value: string) => settingsStore?.searchServiceCategory(value),
        valueGetter: (option: SelectOption) => option?.value,
        placeHolder: 'Service Category',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 295,
      headerTooltip: 'Name',
      cellEditorParams: {
        placeHolder: 'name',
        ignoreNumber: true,
        rules: 'required|string|between:1,256',
      },
    },
    {
      headerName: 'Prepopulate',
      minWidth: 150,
      field: 'isPrepopulate',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      headerTooltip: 'Prepopulate',
      cellRendererParams: { readOnly: true },
      sortable: false,
    },
    {
      headerName: 'NetSuite Code',
      field: 'netSuiteId',
      minWidth: 100,
      headerTooltip: 'NetSuite Code',
      cellEditorParams: {
        placeHolder: 'netSuiteId',
        rules: 'required|numeric|max:99999',
      },
    },
    {
      headerName: 'FBO One',
      field: 'fboOneID',
      minWidth: 100,
      editable: false,
      headerTooltip: 'FBO One',
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
      minWidth: 200,
      maxWidth: 200,
      cellStyle: { ...cellStyle() },
    },
  ];

  const upsertVendorSettingsServiceItemName = (rowIndex: number, agGrid:any, gridState:any): void =>{
    const model = agGrid._getTableItem(rowIndex)
    const serviceCategoryID = model.serviceCategory.id;
    const request = ServiceItemModel.deserialize({ ...model });
    request.serviceCategoryId = serviceCategoryID;
    
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true)
    settingsStore
      ?.upsertSetting(
        request, 
        apiUrls.vendorSettingsServiceItemName, 
        SettingNamesMapper[SETTING_ID.SETTINGS_SERVICE_ITEM_NAME]
        )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false)
          gridState.setIsProcessing(false)
        })
      )
      .subscribe({
        next: (response: ServiceItemModel) => {
          response = ServiceItemModel.deserialize(response);
          agGrid._updateTableItem(
            rowIndex,
            response
          );
        },
        error: error => {
          BaseStore.showAlert(error.message, request.id);
          agGrid._startEditingCell(rowIndex, 'name');
        },
      });
  }

  const serviceCategoryValueFormatter=(serviceCategory:ServiceItemModel)=>{
    return serviceCategory?.id ? `${serviceCategory?.name}` : ''
  }

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      showCollapseExpand={true}
      settingId={SETTING_ID.SETTINGS_SERVICE_ITEM_NAME}
      collectionName="ServiceItemName"
      rightContentActionText="Add Service"
      rightContentAction={VmsModuleSecurity.isEditable}
      isAuditColumnEnabled={true}
      isActionEnabled={true}
      isEditable={VmsModuleSecurity.isEditable}
      selectInputs={[
        agGridUtilities.createSelectOption(
          SERVICE_ITEM_COMPARISON_FILTERS,
          SERVICE_ITEM_COMPARISON_FILTERS.SERVICE_ITEM_NAME,
          'defaultOption'
        ),
      ]}
      onSave={(rowIndex,agGrid,gridState)=>upsertVendorSettingsServiceItemName(rowIndex,agGrid,gridState)} />
  );
};
export default inject('settingsStore')(observer(ServiceItemNameSettings));
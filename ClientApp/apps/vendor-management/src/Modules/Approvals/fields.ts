import { IAPIFilterDictionary } from '@wings-shared/core';
import { APPROVALS_COMPARISON_FILTERS } from '../Shared/Enums/Approvals.enum';
import { ApprovalModel } from '../Shared/Models/Approvals.model';
import { ApprovalDataModel } from '../Shared/Models/ApprovalData.model';

export const gridFilters: IAPIFilterDictionary<APPROVALS_COMPARISON_FILTERS>[] = [
  {
    columnId: 'vendor',
    apiPropertyName: 'VendorName',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.VENDOR,
  },
  {
    columnId: 'entityName',
    apiPropertyName: 'EntityName',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.ENTITY_NAME,
  },
  {
    columnId: 'airportCode',
    apiPropertyName: 'AirportCode',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.AirportCode,
  },
  {
    columnId: 'status',
    apiPropertyName: 'StatusId',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.APPROVAL_STATUS,
  },
  {
    columnId: 'isTopUsageAirport',
    apiPropertyName: 'IsTopUsageAirport',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.TOPUSAGEAIRPORT,
  },
  {
    columnId: 'vendorLevel',
    apiPropertyName: 'VendorLevelName',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.VENDORLEVELNAME,
  },
  {
    columnId: 'airportRank',
    apiPropertyName: 'AirportRank',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.AIRPORTRANK,
  },
  {
    columnId: 'vendorLocation',
    apiPropertyName: 'VendorLocationName',
    uiFilterType: APPROVALS_COMPARISON_FILTERS.VENDORLOCATION,
  }
];


export const getGridData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): ApprovalDataModel[] => {
  let _startIndex = startKeys[0];
  const tableData:ApprovalDataModel[] = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    
    total.push(ApprovalDataModel.deserialize({ ...item }));
    // Check if child available
    if (item.approvalDatas?.length) {
      const result = getGridData(item.approvalDatas, item.path, true,item.id);
      total = total.concat(result);
    }
    return total;
  }, []);
  return tableData;
};

import { ISelectOption, Utilities } from '@wings-shared/core';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '@wings/shared';
import { PermitInfoReviewModel } from '../Shared';

// Check if Status Is Merged or Not
export const isDataMerged = (mergeStatus: string | STAGING_REVIEW_STATUS) => {
  return Utilities.isEqual(mergeStatus, STAGING_REVIEW_STATUS.MERGED);
};

export const isDataRejected = (mergeStatus: string | STAGING_REVIEW_STATUS) => {
  return Utilities.isEqual(mergeStatus, STAGING_REVIEW_STATUS.REJECTED);
};

export const comparisonType = {
  [STAGING_REVIEW_COMPARISION_TYPE.ADDED]: 'Added',
  [STAGING_REVIEW_COMPARISION_TYPE.MODIFIED]: 'Modified',
};

export const mergeStatus = {
  [STAGING_REVIEW_STATUS.NOT_MERGED]: 'Not Merged',
  [STAGING_REVIEW_STATUS.MERGED]: 'Merged',
  [STAGING_REVIEW_STATUS.FAILED]: 'Failed',
  [STAGING_REVIEW_STATUS.REJECTED]: 'Rejected',
};

export const mergeStatusOptions: ISelectOption[] = [
  { label: mergeStatus[1], value: 1 },
  { label: mergeStatus[2], value: 2 },
  { label: mergeStatus[3], value: 3 },
  { label: mergeStatus[4], value: 4 },
];

//Airport Parking Review Grid Data
export const getPermitInfoReview = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number,
  parentId?: number
): PermitInfoReviewModel[] => {
  let _startIndex = 1;

  const tableData = data.reduce<PermitInfoReviewModel[]>((total, item, index) => {
    const currentId = item.id ?? parentId;

    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
      item.id = currentId;
    } else {
      item.path = [ _startIndex ];
      _startIndex++;
    }

    const model = PermitInfoReviewModel.deserialize({
      ...item,
      permitUplinkStagingProperties: [],
    });

    total.push(model);

    if (item.permitUplinkStagingProperties?.length) {
      const childResults = getPermitInfoReview(
        item.permitUplinkStagingProperties,
        item.path,
        true,
        item.permitStagingPropertyId,
        currentId
      );
      total.push(...childResults);
    }

    return total;
  }, []);

  return tableData;
};

export const fields = {
  rejectionReason: {
    label: 'Rejection Reason*',
    rules: 'required',
  },
  rejectionNotes: {
    label: 'Rejection Notes',
    rules: 'between:1,500',
  },
};

export const permitInfoReviwDetail = [
  {
    title: 'Permit Classifications',
    match: /PermitDocuments\[\d+\]\.AppliedPermitClassifications/,
    formatFn: (item: any) => item?.permitClassification?.name || '',
  },
  {
    title: 'Permit Document FAR Types',
    match: /PermitDocuments\[\d+\]\.PermitDocumentFarType/,
    formatFn: (item: any) => item?.farType?.name || '',
  },
  {
    title: 'Rule Values',
    match: /PermitDocuments\[\d+\]\.RuleValues/,
    formatFn: (item: any) => item?.code || item?.ruleValue || '',
  },
  {
    title: 'Applied Airports',
    match: /PermitDocuments\[\d+\]\.AppliedPermitDocumentAirports/,
    formatFn: (item: any) =>
      item?.airportName && item?.airportCode
        ? `${item.airportName} (${item.airportCode})`
        : item?.airportName || '',
  },
];

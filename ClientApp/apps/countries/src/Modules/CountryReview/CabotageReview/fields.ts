import { ISelectOption, Utilities } from '@wings-shared/core';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '@wings/shared';
import { CabotageReviewModel } from '../../Shared';

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

export const getGridData  = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): CabotageReviewModel[] => {
  let _startIndex = 1;
  const tableData = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    total.push(CabotageReviewModel.deserialize({ ...item, cabotageOperationalRequirementStagingProperties: [] }));
    // Check if child available
    if (item.cabotageOperationalRequirementStagingProperties?.length) {
      const result = getGridData(
        item.cabotageOperationalRequirementStagingProperties,
        item.path,
        true,
        item.cabotageOperationalRequirementStagingId
      );
      total = total.concat(result);
    }
    return total;
  }, []);
  return tableData;
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


import { ISelectOption, Utilities } from '@wings-shared/core';
import { BULLETIN_COMPARISON_TYPE, BULLETIN_MERGE_STATUS } from '../../Enums';
import { BulletinReviewModel } from '../../Models';

// Check if Status Is Merged or Not
export const isDataMerged = (mergeStatus: string | BULLETIN_MERGE_STATUS) => {
  return Utilities.isEqual(mergeStatus, BULLETIN_MERGE_STATUS.MERGED);
};

export const isDataRejected = (mergeStatus: string | BULLETIN_MERGE_STATUS) => {
  return Utilities.isEqual(mergeStatus, BULLETIN_MERGE_STATUS.REJECTED);
};

export const comparisonType = {
  [BULLETIN_COMPARISON_TYPE.ADDED]: 'Added',
  [BULLETIN_COMPARISON_TYPE.MODIFIED]: 'Modified',
};

export const getGridData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): BulletinReviewModel[] => {
  let _startIndex = 1;
  const tableData = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    total.push(BulletinReviewModel.deserialize({ ...item, uplinkBulletinStagings: [] }));
    // Check if child available
    if (item.uplinkBulletinStagings?.length) {
      const result = getGridData(item.uplinkBulletinStagings, item.path, true, item.uplinkBulletinStagingId);
      total = total.concat(result);
    }
    return total;
  }, []);
  return tableData;
};

export const mergeStatus = {
  [BULLETIN_MERGE_STATUS.NOT_MERGED]: 'Not Merged',
  [BULLETIN_MERGE_STATUS.MERGED]: 'Merged',
  [BULLETIN_MERGE_STATUS.FAILED]: 'Failed',
  [BULLETIN_MERGE_STATUS.REJECTED]: 'Rejected',
};

export const mergeStatusOptions: ISelectOption[] = [
  { label: mergeStatus[1], value: 1 },
  { label: mergeStatus[2], value: 2 },
  { label: mergeStatus[3], value: 3 },
  { label: mergeStatus[4], value: 4 },
];

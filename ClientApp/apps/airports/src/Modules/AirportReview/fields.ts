import { ISelectOption, Utilities } from '@wings-shared/core';
import {
  AirportHourReviewModel,
  AirportParkingReviewModel,
  CustomGeneralInfoReviewModel,
  MilitaryFieldsReviewModel,
} from '../Shared';
import { STAGING_REVIEW_COMPARISION_TYPE, STAGING_REVIEW_STATUS } from '@wings/shared';

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
export const getAirportParkingData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): AirportParkingReviewModel[] => {
  let _startIndex = 1;
  const tableData = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    total.push(AirportParkingReviewModel.deserialize({ ...item, airportParkingUplinkStagingProperties: [] }));
    // Check if child available
    if (item.airportParkingUplinkStagingProperties?.length) {
      const result = getAirportParkingData(
        item.airportParkingUplinkStagingProperties,
        item.path,
        true,
        item.airportParkingStagingPropertyId
      );
      total = total.concat(result);
    }
    return total;
  }, []);
  return tableData;
};

//Custom General Info Review Grid Data
export const getCustomGeneralInfoData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): CustomGeneralInfoReviewModel[] => {
  let _startIndex = 1;
  const tableData = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    total.push(CustomGeneralInfoReviewModel.deserialize({ ...item, customGeneralInfoUplinkStagingProperties: [] }));
    // Check if child available
    if (item.customGeneralInfoUplinkStagingProperties?.length) {
      const result = getCustomGeneralInfoData(
        item.customGeneralInfoUplinkStagingProperties,
        item.path,
        true,
        item.customGeneralInfoUplinkStagingId
      );
      total = total.concat(result);
    }
    return total;
  }, []);
  return tableData;
};

// Airport hour review Grid data
export const getAirportHourReviewGridData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number,
  parentId?: number
): AirportHourReviewModel[] => {
  let _startIndex = 1;

  const tableData = data.reduce<AirportHourReviewModel[]>((total, item, index) => {
    const currentId = item.id ?? parentId;

    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
      item.id = currentId;
    } else {
      item.path = [ _startIndex ];
      _startIndex++;
    }

    const model = AirportHourReviewModel.deserialize({
      ...item,
      uplinkStagingProperties: [],
    });

    total.push(model);

    if (item.uplinkStagingProperties?.length) {
      const childResults = getAirportHourReviewGridData(
        item.uplinkStagingProperties,
        item.path,
        true,
        item.uplinkStagingPropertyId,
        currentId
      );
      total.push(...childResults);
    }

    return total;
  }, []);

  return tableData;
};

// Military Fields Review Data
export const getMilitaryReviewGridData = (
  data: Array<any>,
  startKeys: number[],
  isChild: boolean,
  parentTableId?: number
): MilitaryFieldsReviewModel[] => {
  let _startIndex = 1;
  const tableData = data.reduce((total, item, index) => {
    if (isChild) {
      item.path = startKeys.concat(index + 1);
      item.parentTableId = parentTableId;
    } else {
      item.path = [ _startIndex ];
      _startIndex = _startIndex + 1;
    }
    total.push(MilitaryFieldsReviewModel.deserialize({ ...item, airportMilitaryUplinkStagingProperties: [] }));
    // Check if child available
    if (item.airportMilitaryUplinkStagingProperties?.length) {
      const result = getMilitaryReviewGridData(
        item.airportMilitaryUplinkStagingProperties,
        item.path,
        true,
        item.airportMilitaryStagingPropertyId
      );
      total = total.concat(result);
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

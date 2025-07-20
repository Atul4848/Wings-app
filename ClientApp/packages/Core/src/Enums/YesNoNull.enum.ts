export enum YES_NO_NULL {
  YES = 1,
  NO,
  NULL,
}

export const getYesNoNullBoolean = (isYes: boolean): YES_NO_NULL => {
  if (isYes) {
    return YES_NO_NULL.YES;
  }
  // isYes can be null also so checking with typeof
  return typeof isYes === 'boolean' ? YES_NO_NULL.NO : YES_NO_NULL.NULL;
};

export const getYesNoNull = (value: YES_NO_NULL): boolean | null => {
  switch (value) {
    case YES_NO_NULL.YES:
      return true;
    case YES_NO_NULL.NO:
      return false;
    default:
      return null;
  }
};

export const getStringToYesNoNull = (value: string | boolean): string => {
  const _value = typeof value === 'string' ? value?.toLocaleLowerCase() : value;
  switch (_value) {
    case false:
    case 'false':
    case 'no':
      return 'No';
    case true:
    case 'true':
    case 'yes':
      return 'Yes';
    default:
      return '';
  }
};

export const getYesNoNullToBoolean = (value: string | boolean): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }
  switch (value?.toLocaleLowerCase()) {
    case 'false':
    case 'no':
      return false;
    case 'true':
    case 'yes':
      return true;
    default:
      return null;
  }
};

export const getBooleanToString = (value: boolean | null): string | null => {
  switch (value) {
    case false:
      return 'False';
    case true:
      return 'True';
    default:
      return null;
  }
};

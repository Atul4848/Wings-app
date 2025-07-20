export enum JOB_TYPE {
  INT = 'INT',
  BOOL = 'BOOL',
  STRING = 'STRING',
}

export enum BOOL_TYPE {
  TRUE = 'true',
  FALSE = 'false',
}

export const JOB_OPTION_REGEX = {
  INT: 'integer',
  DECIMAL: 'regex:/^\\d{0,15}(\\.\\d{1,9})$/',
  BOOL: 'boolean',
  DATE: 'date|regex:/^[0-3][0-9]/[0-3][0-9]/(?:[0-9][0-9])?[0-9][0-9]$/',
  EMAIL: 'email',
  STRING: 'string',
}
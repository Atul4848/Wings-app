import { IAPIFilterDictionary } from '@wings-shared/core';

export function baseGridFiltersDictionary<T>(): IAPIFilterDictionary<T>[] {
  return [
    {
      columnId: 'status',
      apiPropertyName: 'Status.Name',
    },
    {
      columnId: 'accessLevel',
      apiPropertyName: 'AccessLevel.Name',
    },
    {
      columnId: 'sourceType',
      apiPropertyName: 'SourceType.Name',
    },
    {
      columnId: 'modifiedBy',
      apiPropertyName: 'ModifiedBy',
    },
    {
      columnId: 'modifiedOn',
      apiPropertyName: 'ModifiedOn',
    },
    {
      columnId: 'createdBy',
      apiPropertyName: 'CreatedBy',
    },
    {
      columnId: 'createdOn',
      apiPropertyName: 'CreatedOn',
    },
  ];
}

import { SORTING_DIRECTION } from '../Enums/SortingDirection.enum';

/**
 * ag Grid API method getSortModel() returns such object but they didn't specify interface or type.
 * So we have to do it by our own
 */
export interface IGridSortFilter {
  sort: SORTING_DIRECTION | string;
  colId: string;
}

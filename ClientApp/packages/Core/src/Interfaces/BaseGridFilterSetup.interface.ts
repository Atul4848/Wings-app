import { IAPIFilterDictionary } from './API-FilterDictionary.interface';
import { IGridSortFilter } from './IGridSortFilter.interface';

export interface IBaseGridFilterSetup<FilterType extends string> {
  defaultPlaceHolder: string;
  apiFilterDictionary?: IAPIFilterDictionary<FilterType>[];
  filterTypesOptions: FilterType[];
  defaultFilterType: FilterType;
  defaultSortFilters?: IGridSortFilter[];
}

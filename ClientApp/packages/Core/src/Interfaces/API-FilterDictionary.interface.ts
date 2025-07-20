export interface IAPIFilterDictionary<T> {
  columnId: string;
  apiPropertyName: string;
  uiFilterType?: T;
  isArray?: boolean;
}

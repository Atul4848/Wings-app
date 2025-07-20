/**
 * For AgGrid Filters.
 * @param filterType selected filter Type
 * @param dictionary — mapping between filter type and values
 * Usage:
 * const model = new AirportModel();
 * const data = new GridFilter<AIRPORT_FILTERS>({
 *   filterType: AIRPORT_FILTERS.ALL,
 *   dictionary: {
 *     [AIRPORT_FILTERS.ALL]: model.name,
 *     [AIRPORT_FILTERS.NAME]: [model.airportName, model.faaCode, model.billingIATA] }
 * });
 */

import { Utilities } from '@wings-shared/core';

export type IFilterDictionary<Type extends string> = {
  [key in Type]: string | string[];
};

export class GridFilter<Type extends string> {
  private dictionary: IFilterDictionary<Type> = null;
  private filterType: Type = null;

  constructor(init: { filterType: Type; dictionary: IFilterDictionary<Type> }) {
    this.filterType = init?.filterType;
    this.dictionary = this.toLowerCase(init?.dictionary);
  }

  public isFound(searchValue: string | string[], isExactMatch?: boolean): boolean {
    if (!searchValue || !this.dictionary) {
      return true;
    }

    const values: string | string[] = this.dictionary[this.filterType];

    if (Array.isArray(searchValue)) {
      return Array.isArray(values)
        ? values.some(value => searchValue.some(_searchValue => this.filterMatch(_searchValue, value, isExactMatch)))
        : searchValue.some(_searchValue => this.filterMatch(_searchValue, values, isExactMatch));
    }

    return Array.isArray(values)
      ? values.some(value => this.filterMatch(searchValue, value, isExactMatch))
      : this.filterMatch(searchValue, values, isExactMatch);
  }

  private filterMatch(searchValue: string, value: string, isExactMatch?: boolean): boolean {
    if (!searchValue) {
      return true;
    }
    if (isExactMatch) {
      return Utilities.isEqual(value, searchValue);
    }
    return value?.includes(searchValue.trim().toLowerCase());
  }

  private toLowerCase(dictionary: IFilterDictionary<Type>): IFilterDictionary<Type> {
    if (!dictionary) {
      return null;
    }

    const response: IFilterDictionary<Type> = { ...dictionary };
    Object.keys(response).forEach(key => {
      const value = response[key];

      response[key] = Array.isArray(value) ? value.map(v => v?.toLowerCase()) : value?.toLowerCase();
    });
    return response;
  }
}

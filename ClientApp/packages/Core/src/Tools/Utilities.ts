import { GridApi, RowNode } from 'ag-grid-community';
import moment, { Moment } from 'moment';
import { DATE_FORMAT, SEARCH_ENTITY_TYPE } from '../Enums';
import {
  IAPIGridRequest,
  IAPISearchFilter,
  IDMSCordinates,
  IDMSCoordsValue,
  INavigationLink,
  MenuItem,
} from '../Interfaces';
import { AuditHistoryModel, TimeZoneBaseModel } from '../Models';
import DmsCoordinates from 'dms-conversion';
import { baseEntitySearchFilters } from '../Filters';
import { regex } from './Regex';

type CompareValue = string | number | boolean;

export class Utilities {
  static getTempId(): string;
  static getTempId(isNumeric: true): number;

  static getTempId(isNumeric?: boolean): string | number {
    return isNumeric
      ? Math.random() * Math.random()
      : Math.random()
          .toString(36)
          .substr(2, 12);
  }

  // display array string as format a,b and (n) more.
  static displayFormat(listItems: string[]): string {
    if (!listItems || !listItems.length) {
      return '';
    }

    let value = listItems.toString();
    if (listItems.length > 2) {
      value = `${listItems.splice(0, 2).toString()}`;
      value += listItems.length && ` and (${listItems.length}) more`;
    }
    return value;
  }

  static customArraySort<T>(array: T[], sortKey: string, sortKey2?: string): T[] {
    if (!array?.length) {
      return [];
    }
    return [...array].sort((objectA, objectB) => {
      if (this.getFieldValue(objectA, sortKey) < this.getFieldValue(objectB, sortKey)) return -1;
      if (this.getFieldValue(objectA, sortKey) > this.getFieldValue(objectB, sortKey)) return 1;

      if (sortKey2) {
        if (this.getFieldValue(objectA, sortKey2) < this.getFieldValue(objectB, sortKey2)) return -1;
        if (this.getFieldValue(objectA, sortKey2) > this.getFieldValue(objectB, sortKey2)) return 1;
      }
      return 0;
    });
  }

  /**
   * @param tModel data object in which we needs to get value
   * @param key object key it can be simple key i.e user  or  user.firstName | user.role.type
   */
  static getFieldValue<T>(tModel: T, key: string): T {
    // no key return current value
    if (!key || !tModel) {
      return tModel;
    }

    const reduceValue: T = key.split('.').reduce((pre: T, curr: string) => {
      pre = pre[curr];
      return pre;
    }, tModel);
    return reduceValue;
  }

  static getformattedDate(date: string, format?: string, isLocal?: boolean): string {
    if (!date) {
      return null;
    }

    const displayFormat = format ? format : 'DD-MMM-YYYY';
    const momentDate: moment.Moment = isLocal
      ? moment.utc(date, DATE_FORMAT.API_FORMAT).local()
      : moment.utc(date, DATE_FORMAT.API_FORMAT);
    return momentDate.isValid() ? momentDate.format(displayFormat) : '';
  }

  static parseDateTime(date: string, parseFormat?: string): moment.Moment {
    if (!date) {
      return null;
    }
    const momentDate: moment.Moment = moment(date, parseFormat || DATE_FORMAT.API_FORMAT);
    return momentDate.isValid() ? momentDate : null;
  }

  static buildParamString(params: { [key: string]: any }): string {
    const paramsArray: string[] = [];
    for (const key in params) {
      if (this.isEqual(key, 'specifiedFields') && Array.isArray(params[key])) {
        params[key].forEach(element => paramsArray.push(`specifiedFields=${element}`));
      }

      if (params.hasOwnProperty(key) && !this.isEqual(key, 'specifiedFields')) {
        const value = typeof params[key] === 'number' && isFinite(params[key]) ? params[key] : params[key] || '';
        paramsArray.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    return paramsArray.join('&');
  }

  static hasInvalidRowData(gridApi: GridApi): boolean {
    if (!gridApi) {
      return false;
    }
    return gridApi
      .getCellEditorInstances()
      .map(component => component.getFrameworkComponentInstance())
      .some(instance => instance.hasError);
  }

  static getErrorMessages(gridApi: GridApi): string[] {
    if (!gridApi) {
      return [];
    }
    return gridApi
      .getCellEditorInstances()
      .filter(instance => instance.getFrameworkComponentInstance().hasError)
      .map(component => component.getFrameworkComponentInstance().errorMessage);
  }

  static hasPressedEnter(event: KeyboardEvent): boolean {
    return event.code.toLowerCase() === 'enter' || event.code.toLowerCase() === 'numpadenter';
  }

  static customArraySearch<T>(array: T[], searchKey: string, searchValue: string): boolean {
    if (!array?.length) {
      return false;
    }
    return array
      .map((obj: T) => obj[searchKey])
      .some((search: string) => search?.toLowerCase().includes(searchValue?.trim().toLowerCase()));
  }

  static getRowNodes(gridApi: GridApi): RowNode[] {
    const rowNodes: RowNode[] = [];
    gridApi?.forEachNode(node => rowNodes.push(gridApi.getDisplayedRowAtIndex(node.rowIndex)));
    return rowNodes;
  }

  // by default date is current date
  static getCurrentTimeZone(timeZones: TimeZoneBaseModel[], date: moment.Moment = moment()): TimeZoneBaseModel {
    const closetTimezones = [...timeZones].sort((prev: TimeZoneBaseModel, curr: TimeZoneBaseModel) => {
      if (curr.year < prev.year) return -1;
      if (curr.year > prev.year) return 1;
      const currentTimeStamp: number = moment(curr.newLocalTime, moment.ISO_8601).valueOf();
      const prevTimeStamp: number = moment(prev.newLocalTime, moment.ISO_8601).valueOf();
      return currentTimeStamp - prevTimeStamp;
    });
    return closetTimezones.find(timeZone => {
      if (!timeZone.newLocalTime) {
        return timeZone.year === date.year();
      }
      return moment(timeZone.newLocalTime, moment.ISO_8601).valueOf() < date.valueOf();
    });
  }

  static getNumberOrNullValue(value): number | null {
    return value ? (isNaN(Number(value)) ? null : Number(value)) : null;
  }

  static get getCurrentDate(): string {
    return moment().toISOString();
  }

  static get getCurrentDateTime(): string {
    return moment().format(DATE_FORMAT.API_FORMAT);
  }

  static customComparator<T>(current: T, next: T, field?: string): number {
    let valueA = current && field ? current[field] : current;
    let valueB = next && field ? next[field] : next;
    // keep item on current index
    if (!valueA) {
      return -1;
    }
    // move item to next index
    if (!valueB) {
      return 1;
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    return valueA === valueB ? 0 : valueA > valueB ? 1 : -1;
  }

  static customDateComparator(current: string, next: string): number {
    const dateA: Moment = moment(current, DATE_FORMAT.API_DATE_FORMAT);
    const dateB: Moment = moment(next, DATE_FORMAT.API_DATE_FORMAT);
    // keep "current date" on same position
    if (!dateA.isValid()) {
      return -1;
    }
    // move "next date" before "current date"
    if (!dateB.isValid()) {
      return 1;
    }
    return dateA.isSame(dateB) ? 0 : dateA.isAfter(dateB) ? 1 : -1;
  }

  /**
   * Returns new copy of array with provided element. Element will be added to the end of array of replace
   * old array element based on provided predicate. If replace = true and predicate function is provided but element
   * is not found — it will be added as a last element
   * @param array original array that new item should be added into
   * @param newItem new array item to add or replace
   * @param opt.replace if false, new Item will be added to the end of the array
   */
  static updateArray<T>(
    array: T[],
    newItem: T,
    opt?: { replace: boolean; predicate?: (value: T, index: number, obj: T[]) => unknown }
  ): T[] {
    if (!Array.isArray(array)) {
      return [];
    }

    if (!opt?.replace) {
      return [...array, newItem];
    }

    if (opt.replace && typeof opt.predicate !== 'function') {
      throw new Error('For replace item, please provide predicate function');
    }

    const arrayCopy = [...array];
    const index = arrayCopy.findIndex(opt.predicate);
    index === -1 ? arrayCopy.push(newItem) : arrayCopy.splice(index, 1, newItem);
    return arrayCopy;
  }

  static isEqual(valueA: CompareValue, valueB: CompareValue): boolean {
    if (!valueA || !valueB) {
      return false;
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.toLowerCase().trim() === valueB.toLowerCase().trim();
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueA === valueB;
    }

    if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      return valueA === valueB;
    }

    return false;
  }

  static trim(value: string): string {
    if (!value) {
      return '';
    }

    return value.trim();
  }

  static trimLeadingZeros(value: string): string {
    if (!value || typeof value === 'number') {
      return value;
    }

    return value.replace(/^0+/, '');
  }

  static trimEmptyValues<T>(object: T): T {
    return Object.keys(object).reduce<T>((acc: T, key: string) => {
      acc[key] = typeof object[key] === 'string' ? Utilities.trim(object[key]) : object[key];
      return acc;
    }, object);
  }

  // Return true for valid case and false for invalid case
  static compareDateTime(
    startTime: string,
    endTime: string,
    parsingFormat?: string,
    ignoreTime?: boolean,
    ignoreDate?: boolean
  ): boolean {
    if (!startTime || !endTime) {
      return true;
    }
    const _startTime = moment(startTime, parsingFormat || moment.defaultFormat);
    const _endTime = moment(endTime, parsingFormat || moment.defaultFormat);

    if (_startTime.isValid() && _endTime.isValid()) {
      // ignore time value compare date only
      if (ignoreTime) {
        const _startDateTime = _startTime.startOf('day');
        const _endDateTime = _endTime.startOf('day');
        return _endDateTime.isSame(_startDateTime) || _endDateTime.isAfter(_startDateTime);
      }

      // ignore date value compare time only
      if (ignoreDate) {
        const currentDateTime: string = moment().format(DATE_FORMAT.API_FORMAT);
        const __startDateTime = this.combineDateTime(currentDateTime, _startTime.format(DATE_FORMAT.API_FORMAT), true);
        const __endDateTime = this.combineDateTime(currentDateTime, _endTime.format(DATE_FORMAT.API_FORMAT), true);
        return __endDateTime.isSame(__startDateTime) || __endDateTime.isAfter(__startDateTime);
      }
      return _endTime.isSame(_startTime) || _endTime.isAfter(_startTime);
    }

    return false;
  }

  // Overrides for combineDateTime
  static combineDateTime(dateTimeA: string, dateTimeB: string): string;
  static combineDateTime(dateTimeA: string, dateTimeB: string, isMoment?: boolean): Moment;

  // Takes Date value from dateTimeA and Time value from dateTimeB and combine them into single value
  static combineDateTime(dateTimeA: string, dateTimeB: string, isMoment?: boolean): string | Moment {
    if (!dateTimeA || !dateTimeB) {
      return '';
    }
    const _dateTimeA = moment(dateTimeA, DATE_FORMAT.API_FORMAT);
    const _dateTimeB = moment(dateTimeB, DATE_FORMAT.API_FORMAT);

    if (!_dateTimeA.isValid() || !_dateTimeB.isValid()) {
      return '';
    }

    _dateTimeA.hours(_dateTimeB.hours());
    _dateTimeA.minutes(_dateTimeB.minutes());

    if (isMoment) {
      return _dateTimeA;
    }
    return _dateTimeA.format(DATE_FORMAT.API_FORMAT);
  }

  // get date time with specific time
  static getDateTime(hours: number, mins: number): string {
    return moment()
      .utc()
      .hour(hours)
      .minutes(mins)
      .seconds(0)
      .format();
  }

  static getSpecifiedFieldParams(fields: string[]): string {
    const prefix = '&specifiedFields=';
    return `${prefix}${fields.join(prefix)}`;
  }

  /**
   * Returns filterCollection: string  by removing the null values and ignore zero
   * @param filters object of key values
   */
  static filters(filters: object): IAPIGridRequest {
    if (!filters) {
      return null;
    }
    const cloneObject = Object.keys(filters)
      .filter(key => Boolean(filters[key]))
      .reduce((newObject, key) => {
        newObject[key] = filters[key];
        return newObject;
      }, {});

    if (Object.keys(cloneObject).length) {
      return { filterCollection: JSON.stringify([cloneObject]) };
    }
    return null;
  }

  /**
   * Returns boolean: whether a string has a valid json or not.
   * @param value : string
   */
  static isValidJsonString(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   *
   * @param gridApi Ag grid API
   * @param arrayData Data for grid
   * @returns paginated data from the provided array
   */
  static gridApiPaginatedData<T>(gridApi: GridApi, arrayData: T[]): T[] {
    if (!gridApi || !Array.isArray(arrayData)) {
      return [];
    }
    const trimStart = gridApi.paginationGetCurrentPage() * gridApi.paginationGetPageSize();
    const trimEnd = trimStart + gridApi.paginationGetPageSize();
    return arrayData.slice(trimStart, trimEnd);
  }

  /**
   * @param jsonString : string
   */
  static parseJSON(jsonString: string): object {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  }

  static isSameDate(date1: string, date2: string, format: string = DATE_FORMAT.API_FORMAT): boolean {
    const _date1 = moment(date1, format);
    const _date2 = moment(date2, format);
    return _date1.isSame(_date2);
  }

  static isDateInThePast(date: string, isYear = false) {
    // Parse the input date
    const inputDate = moment(date);
    // Get the current date
    const currentDate = moment();
    // Check if the input date's year is before the current date's year
    if (isYear) return inputDate.year() < currentDate.year();
    // Check if the input date is before the current date
    return inputDate.isBefore(currentDate, 'day');
  }

  static getNotFilter(propertyName: string, propertyValue?: string): IAPISearchFilter {
    return { propertyName, propertyValue: propertyValue || null, filterType: 'ne', operator: 'and' };
  }

  static getFilter(propertyName: string, propertyValue: string | number, operator?: 'and' | 'or'): IAPISearchFilter {
    if (!propertyValue) {
      return null;
    }
    const _operator = operator ? { operator } : null;
    return { propertyName, propertyValue, ..._operator };
  }

  // 55641 Used to Generate Tree Path
  // https://www.ag-grid.com/javascript-data-grid/tree-data/
  static getAuditHistoryData(data: AuditHistoryModel[], startKeys: number[], isChild: boolean): AuditHistoryModel[] {
    let _startIndex = 1;
    const auditData = data.reduce((total, item, index) => {
      if (isChild) {
        item.path = startKeys.concat(index + 1);
      } else {
        item.path = [_startIndex];
        _startIndex = _startIndex + 1;
      }
      total.push({ ...item, changes: [] });
      // Check if child available
      if (item.changes?.length) {
        const result = this.getAuditHistoryData(item.changes, item.path, true);
        total = total.concat(result);
      }
      return total;
    }, []);
    return auditData;
  }

  static getLatLongDMSCoords(long: number, lat: number): IDMSCordinates {
    let longitude: number = Utilities.getNumberOrNullValue(long);
    let latitude: number = Utilities.getNumberOrNullValue(lat);
    if (!Boolean(longitude) || longitude < -180 || longitude > 180) {
      longitude = 0;
    }
    if (!Boolean(latitude) || latitude < -90 || latitude > 90) {
      latitude = 0;
    }
    return new DmsCoordinates(latitude, longitude).dmsArrays;
  }

  static dmsCoords(dmsCoords: IDMSCoordsValue): string {
    const [d, m, s, nsew] = dmsCoords;
    const trimmedSecond = parseFloat(parseFloat(s?.toString()).toFixed(4));
    return `${d}° ${m}' ${trimmedSecond}'' ${nsew}`;
  }

  // See demo in UpsertSchedule Restrictions component
  static getSearchRequest(
    searchValue: string,
    entityType: SEARCH_ENTITY_TYPE,
    filterCollection?: IAPISearchFilter[]
  ): IAPIGridRequest {
    const _entity = baseEntitySearchFilters[entityType];

    if (!_entity) {
      return null;
    }

    const searchCollection: IAPISearchFilter[] = _entity?.searchFilters.map(filter => {
      return {
        ...filter,
        propertyValue: searchValue,
      };
    });
    return {
      specifiedFields: _entity?.specifiedFields,
      searchCollection: JSON.stringify(searchCollection),
      filterCollection: JSON.stringify(filterCollection || []),
      pageSize: 50,
    };
  }

  static objectHasValues(obj): boolean {
    return Object.keys(obj).some(key => {
      const value = obj[key];

      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return Boolean(value.length);
        }
        if (!value) {
          return Boolean(value);
        }
        return Object.keys(value).length ? this.objectHasValues(value) : false;
      }
      if (typeof value === 'boolean') {
        return true;
      }
      return Boolean(value);
    });
  }

  static updateSidebarOptions(
    options: any,
    tabQuery: string,
    searchQueryParams?: string
  ): INavigationLink[] | MenuItem[] {
    const updatedOptions = options.map(link =>
      link.title === tabQuery
        ? {
            ...link,
            to: window.location.pathname + (searchQueryParams ? searchQueryParams : ''),
          }
        : { ...link }
    );
    return updatedOptions;
  }

  static getFirstMatch(value: string): string {
    const result = value.match(regex.startsWithAlphaNumericCharacters);
    if (!Boolean(result.length)) return '';
    return result[0];
  }
}

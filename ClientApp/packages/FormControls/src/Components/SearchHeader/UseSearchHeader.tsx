import { ISelectOption, SearchStore, Utilities } from '@wings-shared/core';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { PureChipInputControl } from '../ChipInputControl/ChipInputControl';
import { PureSearchInputControl } from '../SearchInputControl/SearchInputControl';

export interface IFilters {
  searchValue: string;
  chipValue: Array<string | ISelectOption>;
  selectInputsValues: Map<string, string>;
}

export enum SEARCH_HEADER_EVENTS {
  ON_SEARCH,
  ON_CHIP_ADD_REMOVE,
  ON_SELECTION_CHANGE,
  ON_RESTORE_FILTERS,
}

export interface IUseSearchHeader {
  resetInputs: () => void;
  setSearchValue: (searchValue) => void;
  searchValue: string;
  chipValue: any[];
  searchType: any;
  setChipValue: (searchValue) => void;
  //Select Input Values
  setSelectInputsValues: (map: Map<string, string>) => void;
  selectInputsValues: any;
  onSelectionChange: (fieldKey, value, forceRefresh?) => void;
  hasSearchValue: boolean;
  setupDefaultFilters: (filter: IFilters) => void;
  getFilters: () => IFilters;
  // ref to the input controls
  chipInputRef: MutableRefObject<PureChipInputControl>;
  searchInputRef: MutableRefObject<PureSearchInputControl>;

  // Trigger Events
  eventType: SEARCH_HEADER_EVENTS;
  refreshFiltersKey: string;
  triggerEvent: (event: SEARCH_HEADER_EVENTS) => void;

  // Used to Save and Restore Search filters
  saveSearchFilters: (gridState) => void;
  restoreSearchFilters: (gridState, callback: () => void) => void;
}

export const useSearchHeader = (): IUseSearchHeader => {
  const filtersRef = useRef({
    searchValue: '',
    chipValue: [],
    selectInputsValues: new Map(),
  });

  const [ selectInputsValues, setSelectInputsValues ] = useState(new Map());
  const [ searchValue, setSearchValue ] = useState('');
  const [ chipValue, setChipValue ] = useState([]);

  // ref to the input controls
  const chipInputRef = useRef<PureChipInputControl>();
  const searchInputRef = useRef<PureSearchInputControl>();

  // Helps to trigger events
  const [ refreshFiltersKey, setRefreshFiltersKey ] = useState(Utilities.getTempId());
  const [ eventType, setEventType ] = useState<SEARCH_HEADER_EVENTS>();

  useEffect(() => {
    filtersRef.current = {
      searchValue,
      chipValue,
      selectInputsValues,
    };
  }, [ searchValue, chipValue, selectInputsValues ]);

  // Reset Input Controls Values
  /* istanbul ignore next */
  const resetInputs = (): void => {
    setSearchValue('');
    setChipValue([]);
    chipInputRef.current?.clearInputValue();
    searchInputRef.current?.clearInputValue();
  };

  const setupDefaultFilters = (filters: IFilters): void => {
    if (!filters.selectInputsValues.size) {
      return;
    }
    setSearchValue(filters.searchValue);
    setChipValue(filters.chipValue);
    setSelectInputsValues(filters.selectInputsValues);
    // Give some time to create ref obj
    setTimeout(() => {
      searchInputRef.current?.setInputValue(filters.searchValue);
      triggerEvent(SEARCH_HEADER_EVENTS.ON_RESTORE_FILTERS);
    }, 500);
  };

  const triggerEvent = (event: SEARCH_HEADER_EVENTS) => {
    setEventType(event);
    setRefreshFiltersKey(Utilities.getTempId());
  };

  return {
    chipInputRef,
    searchInputRef,
    selectInputsValues,
    searchValue,
    chipValue,
    setChipValue,
    setSearchValue,
    setSelectInputsValues,
    resetInputs,
    hasSearchValue: Boolean(searchValue),
    searchType: selectInputsValues.get('defaultOption'),
    getFilters: () => filtersRef.current,
    setupDefaultFilters,
    onSelectionChange: (fieldKey, updatedValue, forceRefresh) => {
      //clear inputs before selection
      resetInputs();
      const siv = new Map(selectInputsValues);
      siv.set(fieldKey, updatedValue);
      setSelectInputsValues(siv);
      // If user searched something then only we need to refresh grid else no need
      if (searchValue || chipValue?.length || forceRefresh) {
        triggerEvent(SEARCH_HEADER_EVENTS.ON_SELECTION_CHANGE);
      }
    },
    // Used to trigger the updates
    eventType,
    refreshFiltersKey,
    triggerEvent,
    // Save Search Data
    saveSearchFilters: gridState => {
      SearchStore.saveSearchData(location.pathname, {
        ...filtersRef.current,
        pagination: gridState.pagination,
      });
      const sortFilters = gridState.gridApi.getSortModel();
      if (sortFilters) {
        SearchStore.saveSortData(location.pathname, sortFilters);
      }
    },
    restoreSearchFilters: (gridState, callback) => {
      // Restore Search Result based on available history
      const searchData = SearchStore.searchData.get(location.pathname);
      if (searchData) {
        gridState.setPagination(searchData.pagination);
        setupDefaultFilters(searchData);
        SearchStore.clearSearchData(location.pathname);
        return;
      }
      // if search data available then callback will be called by the event else called directly
      callback();
    },
  };
};

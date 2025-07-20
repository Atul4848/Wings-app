import { action, observable } from 'mobx';
import { IClientSearchValue, IGridSortFilter, ISelectOption } from '../Interfaces';
import { GridPagination } from '../Models';
import { GridApi } from 'ag-grid-community';

class SearchData {
  searchValue: string = '';
  chipValue: any[];
  selectInputsValues: Map<string, string> = new Map();
  pagination: GridPagination = null;
  constructor(data?: Partial<SearchData>) {
    Object.assign(this, data);
  }
}

class SearchStore {
  @observable url: string = '';
  // Search Data For v2 Version
  @observable searchData: Map<string, SearchData> = new Map();
  @observable sortData: Map<string, IGridSortFilter[]> = new Map();
  @observable public clientSearchValue: IClientSearchValue = {
    searchValue: '',
    selectedOption: '',
    otherSelectedOption: '',
    chipValue: [],
  };

  // V2 version code
  @action
  public saveSearchData(key: string, searchData: Partial<SearchData>) {
    this.searchData = this.searchData.set(key, new SearchData(searchData));
  }

  @action
  public saveSortData(key: string, sortData: IGridSortFilter[]) {
    this.sortData = this.sortData.set(key, sortData);
  }

  @action
  public applyDefaultSortFilter(key: string, gridApi: GridApi) {
    const sortData = this.sortData.get(key);
    if(sortData) {
      const currentSortModel = gridApi.getSortModel();
      const mergedSortModel = currentSortModel.concat(sortData);
      gridApi.setSortModel(mergedSortModel);
      this.clearSortData(key);
    }
  }

  // V2 version code
  @action
  public clearSearchData(key: string) {
    this.searchData.delete(key);
  }

  // V2 version code
  @action
  public clearSortData(key: string) {
    this.sortData.delete(key);
  }

  // Deprecating soon!! after v2 ready
  @action
  public setclientSearchValue(
    clientSearchValue: IClientSearchValue = {
      searchValue: '',
      selectedOption: '',
      otherSelectedOption: '',
      chipValue: [],
    }
  ): void {
    this.clientSearchValue = clientSearchValue;
    this.url = window.location.pathname;
  }

  // Deprecating soon!! after v2 ready
  @action
  public clearSearch(): void {
    this.clientSearchValue = {
      searchValue: '',
      selectedOption: '',
      otherSelectedOption: '',
      chipValue: [],
    };
  }
}

const searchStore = new SearchStore();

export default searchStore;

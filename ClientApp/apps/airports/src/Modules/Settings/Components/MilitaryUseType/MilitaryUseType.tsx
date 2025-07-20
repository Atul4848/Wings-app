import React, { ReactNode } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { Theme } from '@material-ui/core';
import { CustomAgGridReact, BaseGrid } from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { action } from 'mobx';
import { AirportSettingsStore, MilitaryUseTypeModel, MILITARY_USE_TYPE_FILTER } from '../../../Shared';
import { SearchHeader } from '@wings-shared/form-controls';
import { IClasses, UIStore, IBaseGridFilterSetup } from '@wings-shared/core';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  classes?: IClasses;
  theme?: Theme;
}

const filtersSetup: IBaseGridFilterSetup<MILITARY_USE_TYPE_FILTER> = {
  defaultPlaceHolder: 'Search by Code',
  filterTypesOptions: Object.values(MILITARY_USE_TYPE_FILTER),
  defaultFilterType: MILITARY_USE_TYPE_FILTER.CODE,
};

@inject('airportSettingsStore')
@observer
class MilitaryUseType extends BaseGrid<Props, MilitaryUseTypeModel, MILITARY_USE_TYPE_FILTER> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadMilitaryUseTypes();
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  @action
  private loadMilitaryUseTypes() {
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .loadMilitaryUseTypes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => (this.data = response.results));
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      editable: false,
    },
    {
      headerName: 'Name',
      field: 'name',
      editable: false,
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      gridActionProps: {
        showDeleteButton: false,
      },
    });
    return {
      ...baseOptions,
      doesExternalFilterPass: node => {
        const { id, code, name } = node.data as MilitaryUseTypeModel;
        return (
          !id ||
          this._isFilterPass({
            [MILITARY_USE_TYPE_FILTER.CODE]: code,
            [MILITARY_USE_TYPE_FILTER.NAME]: name,
          })
        );
      },
    };
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as MILITARY_USE_TYPE_FILTER)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
        />
        <CustomAgGridReact
          isRowEditing={this.isRowEditing}
          rowData={this.data}
          gridOptions={this.gridOptions}
          disablePagination={this.isRowEditing}
        />
      </>
    );
  }
}

export default MilitaryUseType;

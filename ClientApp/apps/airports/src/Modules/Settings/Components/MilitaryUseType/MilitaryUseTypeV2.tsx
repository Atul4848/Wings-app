import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AirportSettingsStore, MilitaryUseTypeModel, MILITARY_USE_TYPE_FILTER } from '../../../Shared';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const MilitaryUseType: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<MILITARY_USE_TYPE_FILTER, MilitaryUseTypeModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadMilitaryUseTypes();
  }, []);

  /* istanbul ignore next */
  const loadMilitaryUseTypes = () => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .loadMilitaryUseTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response.results));
  };

  const columnDefs: ColDef[] = [
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
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      gridActionProps: {
        showDeleteButton: false,
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, code, name } = node.data as MilitaryUseTypeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [MILITARY_USE_TYPE_FILTER.CODE]: code,
              [MILITARY_USE_TYPE_FILTER.NAME]: name,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(MILITARY_USE_TYPE_FILTER, MILITARY_USE_TYPE_FILTER.CODE) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('airportSettingsStore')(observer(MilitaryUseType));

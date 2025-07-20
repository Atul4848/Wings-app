import { GRID_ACTIONS, SettingsTypeModel, Utilities } from '@wings-shared/core';
import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { useSearchHeader, SearchHeaderV3 } from '@wings-shared/form-controls';
import {
  airportBasePath,
  AirportStore,
  updateAirportSidebarOptions,
  VENDOR_LOCATION_FILTERS,
  VendorLocationModel
} from '../../../Shared';
import { gridFilters } from './fields';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { Chip, Tooltip } from '@material-ui/core';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { useParams } from 'react-router-dom';
import { useStyles } from './VendorLocations.styles';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const VendorLocation: FC<Props> = ({ airportStore, sidebarStore }) => {
  const classes = useStyles();
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LOCATION_FILTERS, VendorLocationModel>(gridFilters, gridState);
  const searchHeader = useSearchHeader();
  const _airportStore = airportStore as AirportStore;

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Vendor Locations', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    const vendorLocations = _airportStore.selectedAirport?.vendorLocations;
    gridState.setGridData(vendorLocations as VendorLocationModel[]);
  }, []);

  /* istanbul ignore next */
  const viewRenderer = (
    operationTypeChips: SettingsTypeModel[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode => {
    if (operationTypeChips) {
      const numTags = operationTypeChips.length;
      const limitTags = 1;
      const chipsList = isReadMode ? operationTypeChips : [ ...operationTypeChips ].slice(0, limitTags);
      return (
        <div>
          {Utilities.customArraySort(chipsList, 'label').map((appliedOperationType: any, index) => (
            <Tooltip title={appliedOperationType ? appliedOperationType.operationType?.name : ''} key={index}>
              <Chip
                color="primary"
                key={appliedOperationType.operationType?.id}
                label={appliedOperationType ? appliedOperationType.operationType?.name : ''}
                {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
              />
            </Tooltip>
          ))}
          {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
        </div>
      );
    } else return <></>;
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Vendor',
      field: 'vendor.name',
      headerTooltip: 'Vendor',
    },
    {
      headerName: 'Vendor Code',
      field: 'vendor.code',
      headerTooltip: 'Vendor Code',
    },
    {
      headerName: 'Location Name',
      field: 'name',
      headerTooltip: 'Location Name',
    },
    {
      headerName: 'Location Code',
      field: 'code',
      headerTooltip: 'Location Code',
    },
    {
      headerName: 'Status',
      field: 'vendorLocationStatus',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Status',
    },
    {
      headerName: 'Operation Type',
      field: 'operationalEssential.appliedOperationType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Operation Type',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) =>
          viewRenderer(node.data?.operationalEssential?.appliedOperationType, null, true),
      },
    },
    {
      headerName: 'Vendor Level',
      field: 'operationalEssential.vendorLevel',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Vendor Level',
    },
    {
      headerName: 'Rank At Airport',
      field: 'airportRank',
      headerTooltip: 'Rank At Airport',
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: (node: RowNode) => [
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
            },
          ],
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            if (rowIndex === null) {
              return;
            }
            if (action === GRID_ACTIONS.DETAILS) {
              const data: VendorLocationModel = agGrid._getTableItem(rowIndex);
              const navigateTo = `/vendor-management/vendor-location/upsert/${data.vendor.id}/${data.id}/detail`;
              window.open(navigateTo, '_blank');
            }
          },
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
      gridActionProps: {
        isActionMenu: true,
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        getDisabledState: () => gridState.hasError,
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, code, vendorLocationStatus, vendor, name } = node.data as VendorLocationModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [VENDOR_LOCATION_FILTERS.LOCATION_CODE]: code,
              [VENDOR_LOCATION_FILTERS.LOCATION_NAME]: name,
              [VENDOR_LOCATION_FILTERS.VENDOR_NAME]: vendor.label,
              [VENDOR_LOCATION_FILTERS.VENDOR_CODE]: vendor.code,
              [VENDOR_LOCATION_FILTERS.LOCATION_STATUS]: vendorLocationStatus.label,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_airportStore.selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  };
  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(VENDOR_LOCATION_FILTERS, VENDOR_LOCATION_FILTERS.VENDOR_NAME),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onExpandCollapse={agGrid.autoSizeColumns}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('sidebarStore', 'airportStore')(observer(VendorLocation));

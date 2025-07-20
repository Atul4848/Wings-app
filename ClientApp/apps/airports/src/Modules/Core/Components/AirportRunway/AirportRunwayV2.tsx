import React, { FC, ReactNode, useEffect } from 'react';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { GridOptions, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import {
  AirportRunwayModel,
  AirportStore,
  AirportModel,
  AirportSettingsStore,
  updateAirportSidebarOptions,
  useAirportModuleSecurity,
  airportBasePath,
} from '../../../Shared';
import { useStyles } from './AirportRunway.styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  AccessLevelModel,
  ISelectOption,
  SourceTypeModel,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import RunwayClosure from './RunwayClosure/RunwayClosure';
import { useParams } from 'react-router-dom';
import { CustomLinkButton, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportRunway: FC<Props> = ({ airportStore, airportSettingsStore, sidebarStore }) => {
  const params = useParams();
  const gridState = useGridState();
  const classes = useStyles();
  const agGrid = useAgGrid<[], AirportRunwayModel>([], gridState);
  const _airportStore = airportStore as AirportStore;
  const _airportSettingStore = airportSettingsStore as AirportSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();
  const isEditable = !airportModuleSecurity.isEditable || !airportStore?.selectedAirport?.isActive;

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    _sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Runways', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    gridState.setGridData(_selectedAirport.runways);
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: 'Runway Id',
      field: 'runwayId',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'Length',
      field: 'runwayLength',
    },
    {
      headerName: 'Width',
      field: 'width',
    },
    {
      headerName: 'Elevation',
      field: 'elevation',
    },
    {
      headerName: 'Center Line Spacing',
      field: 'centerLineSpacing',
    },
    {
      headerName: 'Status Date',
      field: 'statusDate',
    },
    {
      headerName: 'Surface Treatment',
      field: 'runwaySurfaceTreatment',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Surface Type I',
      field: 'runwaySurfacePrimaryType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Surface Type II',
      field: 'runwaySurfaceSecondaryType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Light Type',
      field: 'runwayLightType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Condition',
      field: 'runwayCondition',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Access Level',
      columnGroupShow: 'open',
      field: 'accessLevel',
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Source',
      columnGroupShow: 'open',
      field: 'sourceType',
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      columnGroupShow: 'open',
      cellRenderer: 'statusRenderer',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: rowNode => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            to: node => `${node.data.id}/edit`,
            isHidden: isEditable,
          },
          {
            title: 'Details',
            action: GRID_ACTIONS.DETAILS,
            to: node => `${node.data.id}/detail`,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airport Runway',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      detailCellRenderer: 'customDetailCellRenderer',
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: airportModuleSecurity.isEditable,
        isParentRowEditing: () => gridState.isRowEditing,
        airportStore: _airportStore,
        airportSettingsStore: _airportSettingStore,
      },
      pagination: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customDetailCellRenderer: RunwayClosure,
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <div className={classes.addHoursContainer}>
        <ExpandCollapseButton onExpandCollapse={() => agGrid.autoSizeColumns()} />
        <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={'new'}
            title="Add Runway"
            disabled={isEditable}
          />
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('airportStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportRunway));

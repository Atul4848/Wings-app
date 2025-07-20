import React, { ReactNode } from 'react';
import { AgGridStatusBadge, BaseGrid, CustomAgGridReact, AgGridActions } from '@wings-shared/custom-ag-grid';
import { GridOptions, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import {
  AirportRunwayModel,
  AirportModuleSecurity,
  AirportStore,
  AirportModel,
  AirportSettingsStore,
  updateAirportSidebarOptions,
} from '../../../Shared';
import { withStyles } from '@material-ui/core';
import { styles } from './AirportRunway.styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  AccessLevelModel,
  IClasses,
  ISelectOption,
  SourceTypeModel,
  Utilities,
  withRouter,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { CustomLinkButton, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import RunwayClosure from './RunwayClosure/RunwayClosure';

interface Props {
  classes?: IClasses;
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  params?: { airportId: number; icao: string; viewMode:string; };
  sidebarStore?:typeof SidebarStore;
}

@inject('airportStore', 'airportSettingsStore','sidebarStore')
@observer
class AirportRunway extends BaseGrid<Props, AirportRunwayModel> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.params) {
      const { airportId, icao, viewMode } = this.props.params;
      this.props.sidebarStore?.setNavLinks(
        updateAirportSidebarOptions('Runways', window.location.search,!Boolean(airportId)),
        `/airports/upsert/${airportId}/${icao}/${viewMode}`
      );
    }
    const { runways } = this.props.airportStore?.selectedAirport as AirportModel;
    this.data = runways;
  }

  /* istanbul ignore next */
  private get isEditable(): boolean {
    return !AirportModuleSecurity.isEditable || !this.props.airportStore?.selectedAirport?.isActive;
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
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
    ...this.auditFields,
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
            isHidden: this.isEditable,
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
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airport Runway',
        getDisabledState: () => this.hasError,
      },
    });

    return {
      ...baseOptions,
      detailCellRenderer: 'customDetailCellRenderer',
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: AirportModuleSecurity.isEditable,
        isParentRowEditing: () => this.isRowEditing,
        airportStore: this.props.airportStore,
        airportSettingsStore: this.props.airportSettingsStore,
      },
      pagination: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        statusRenderer: AgGridStatusBadge,
        customDetailCellRenderer: RunwayClosure,
      },
    };
  }

  private get headerActions(): ReactNode {
    const { airportStore } = this.props;
    return (
      <DetailsEditorHeaderSection
        title={airportStore?.selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  }

  public render(): ReactNode {
    const { classes, airportStore } = this.props as Required<Props>;
    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={false}>
        <div className={classes.addHoursContainer}>
          <ExpandCollapseButton onExpandCollapse={() => this.autoSizeColumns()} />
          <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
            <CustomLinkButton
              variant="contained"
              startIcon={<AddIcon />}
              to={'new'}
              title="Add Runway"
              disabled={this.isEditable}
            />
          </ViewPermission>
        </div>
        <div className={classes.gridWrapper}>
          <CustomAgGridReact rowData={this.data} gridOptions={this.gridOptions} />
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(AirportRunway));
export { AirportRunway as PureAirportRunway };

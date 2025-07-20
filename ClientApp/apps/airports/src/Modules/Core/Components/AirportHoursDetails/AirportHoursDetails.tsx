import React, { ReactNode } from 'react';
import { AuditHistory, baseApiPath } from '@wings/shared';
import { BaseGrid } from '@wings-shared/custom-ag-grid';
import { GridOptions, SortChangedEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { CommonAirportHoursGrid } from '../../../AirportHours/Components';
import {
  AirportHoursModel,
  AirportHoursStore,
  AirportModuleSecurity,
  AirportStore,
  AIRPORT_AUDIT_MODULES,
} from '../../../Shared';
import { IconButton, withStyles } from '@material-ui/core';
import { styles } from './AirportHoursDetails.styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { action } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  GridPagination,
  IAPIGridRequest,
  IClasses,
  UIStore,
  withRouter,
  ViewPermission,
  GRID_ACTIONS,
  IGridSortFilter,
} from '@wings-shared/core';
import { CustomLinkButton, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

type UrlParams = { airportId: number; icao: string };

interface Props {
  classes?: IClasses;
  airportStore?: AirportStore;
  airportHoursStore?: AirportHoursStore;
  params?: UrlParams;
}

@inject('airportHoursStore', 'airportStore')
@observer
class AirportHoursDetails extends BaseGrid<Props, AirportHoursModel> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadAirportHours();
  }

  /* istanbul ignore next */
  private loadAirportHours(pageRequest?: IAPIGridRequest): void {
    const { airportId } = this.props.params as UrlParams;
    if (!airportId) {
      return;
    }
    const request: IAPIGridRequest = {
      ...pageRequest,
      ...this._sortFilters,
      filterCollection: JSON.stringify([{ propertyName: 'Airport.AirportId', propertyValue: airportId }]),
    };
    UIStore.setPageLoader(true);
    this.props.airportHoursStore
      ?.loadAirportHours(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          this.data = response.results;
          this.pagination = new GridPagination({ ...response });
        },
      });
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: AirportHoursModel = this._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.airport?.label || model.icao}
          entityId={model.id}
          entityType={AIRPORT_AUDIT_MODULES.AIRPORT_HOURS}
          baseUrl={baseApiPath.airports}
        />
      );
    }
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: [],
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airport Hours',
        getDisabledState: () => this.hasError,
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      onSortChanged: ({ api }: SortChangedEvent) => {
        this.sortFilters = api.getSortModel() as IGridSortFilter[];
        this.loadAirportHours();
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
    };
  }

  private get headerActions(): ReactNode {
    return (
      <DetailsEditorHeaderSection
        title={this.props.airportStore?.selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    const params = this.props.params as UrlParams;
    return (
      <DetailsEditorWrapper headerActions={this.headerActions} isEditMode={false}>
        <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
          <div className={classes.addHoursContainer}>
            <ExpandCollapseButton onExpandCollapse={() => this.autoSizeColumns()} />
            <CustomLinkButton
              variant="contained"
              startIcon={<AddIcon />}
              to={`/airports/airport-hours/${params.airportId}/${params.icao}/new?backNav=airports`}
              title="Add Hours"
              disabled={!this.props.airportStore?.selectedAirport?.isActive}
            />
          </div>
        </ViewPermission>
        <div className={classes.gridWrapper}>
          <CommonAirportHoursGrid
            rowData={this.data}
            params={params}
            auditFields={this.auditFields}
            gridOptions={this.gridOptions}
            serverPagination={true}
            paginationData={this.pagination}
            isAirportScreen={true}
            onPaginationChange={request => this.loadAirportHours(request)}
            onAction={(action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex)}
            nameSearchFilterParams={this.nameSearchFilterParams.bind(this)}
          />
        </div>
      </DetailsEditorWrapper>
    );
  }
}

export default withRouter(withStyles(styles)(AirportHoursDetails));
export { AirportHoursDetails as PureAirportHoursDetails };

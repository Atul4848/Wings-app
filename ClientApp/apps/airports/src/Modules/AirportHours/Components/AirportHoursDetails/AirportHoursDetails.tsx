import React, { ReactNode, RefObject } from 'react';
import { BaseUpsertComponent, VIEW_MODE, AirportModel, ModelStatusOptions } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import { withStyles, Typography, IconButton, Paper } from '@material-ui/core';
import { styles } from './AirportHoursDetails.styles';
import {
  AirportHoursStore,
  AirportSettingsStore,
  AirportHoursModel,
  AirportHoursSubTypeModel,
  AirportHoursTypeModel,
  updatedAirportSidebarOptions,
  airportSidebarOptions,
} from '../../../Shared';
import { takeUntil, finalize } from 'rxjs/operators';
import { fields } from './Fields';
import { forkJoin, Observable } from 'rxjs';
import { action, observable } from 'mobx';
import AirportHoursGrid, { PureHoursGrid } from './AirportHoursGrid/AirportHoursGrid';
import { ArrowBack, DescriptionOutlined, AspectRatio } from '@material-ui/icons';
import OtOrHoursDetails from './OtOrHoursDetails/OtOrHoursDetails';
import { AirportHeaderSection, AirportHoursInformation } from '../../Components';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IClasses,
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
  withRouter,
  ViewPermission,
  IdNameCodeModel,
} from '@wings-shared/core';
import { CustomLinkButton, ConfirmDialog, SidebarStore } from '@wings-shared/layout';
import { SCHEDULE_TYPE } from '@wings-shared/scheduler';
import { NavigateFunction } from 'react-router';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

type Params = { airportId: number; icao: string; airportHoursTypeId: number; viewMode: VIEW_MODE };

interface Props {
  // With Router params,searchParams,viewMode
  params?: Params;
  searchParams?: URLSearchParams;
  navigate?: NavigateFunction;
  viewMode?: VIEW_MODE;
  airportHoursStore?: AirportHoursStore;
  airportSettingsStore?: AirportSettingsStore;
  classes?: IClasses;
  sidebarStore?: typeof SidebarStore;
}

@inject('airportHoursStore', 'airportSettingsStore', 'sidebarStore')
@observer
class AirportHoursDetails extends BaseUpsertComponent<Props, AirportHoursModel> {
  private hoursGridRef: RefObject<PureHoursGrid> = React.createRef<PureHoursGrid>();
  @observable private airportHourSubTypes: AirportHoursSubTypeModel[] = [];
  @observable protected columnResizeSource: string = '';

  constructor(p: Props) {
    super(p, fields);
    const { viewMode } = this.props.params as Params;
    this.viewMode = viewMode || VIEW_MODE.EDIT;
  }

  private get isAirportScreen(): boolean {
    return Utilities.isEqual(this.props.searchParams?.get('backNav') || '', 'airports');
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  private get airportHoursStore(): AirportHoursStore {
    return this.props.airportHoursStore as AirportHoursStore;
  }

  private get sidebarStore(): typeof SidebarStore {
    return this.props.sidebarStore as typeof SidebarStore;
  }

  private get airportHoursGridRef(): PureHoursGrid {
    return this.hoursGridRef.current as PureHoursGrid;
  }

  private get hasAirportAndAirportHoursType(): boolean {
    const airport = this.getField('airport').value;
    const airportHoursType = this.getField('airportHoursType').value;
    return Boolean(airport && airportHoursType);
  }

  /* istanbul ignore next */
  componentDidMount() {
    UIStore.setPageLoader(true);
    this.props.sidebarStore?.setNavLinks(
      updatedAirportSidebarOptions('Airport Hours', window.location.search),
      'airports'
    );
    forkJoin([
      this.searchWingsAirports(this.props.params?.icao || ''),
      this.airportSettingsStore.loadAirportHourTypes(),
      this.airportSettingsStore.getAirportHoursRemarks(),
      this.airportSettingsStore.loadTypes(),
    ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ airports ]) => {
        const { icao, airportId, airportHoursTypeId } = this.props.params as Params;
        if (icao) {
          // In case ICAO not available then create inactive airport 48272
          const airport =
            airports.find(airport => Utilities.isEqual(airport.displayCode, icao)) ||
            new AirportModel({
              id: airportId,
              icao: new IdNameCodeModel({ code: icao }),
              displayCode: icao,
              status: ModelStatusOptions[1],
            });
          this.getField('airport').set(airport);
        }

        if (airportHoursTypeId) {
          const airportHoursType = this.airportSettingsStore.airportHourTypes.find(({ id }) =>
            Utilities.isEqual(id, Number(airportHoursTypeId))
          );
          this.getField('airportHoursType').set(airportHoursType);
          this.setAirportHoursSubTypes(Number(airportHoursTypeId));
          this.loadAirportHours();
        }
      });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.props.sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    this.airportHoursStore.reset();
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'airport':
      case 'associateAirport':
        // clear TFO AIrports to get Updated Timezone information
        this.airportHoursStore.wingsAirports = [];
        this.airportHoursStore.tfoAirports = [];
        this.loadAirportHours();
        break;
      case 'airportHoursType':
        this.loadAirportHours();
        this.setAirportHoursSubTypes(Number((value as ISelectOption)?.value));
        break;
    }
  }

  /* istanbul ignore next */
  @action
  private searchWingsAirports(searchValue: string): Observable<AirportModel[]> {
    this.loader.showLoader();
    return this.airportHoursStore.searchWingsAirportsByCode(searchValue, { excludeRetail: true }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loader.hideLoader())
    );
  }

  /* istanbul ignore next */
  public loadAirportHours(): void {
    const { airport, associateAirport, airportHoursType } = this.form.values();
    if (!airport || !airportHoursType) {
      return;
    }
    UIStore.setPageLoader(true);

    const airportTypeFilter = Utilities.getFilter('AirportHoursType.Name', airportHoursType.label);

    // If Associated airport is selected then we needs to load airport hours for both type airports
    const isAssociatedAirports = Boolean(associateAirport?.id);
    const associateAirportFilter = isAssociatedAirports
      ? [ Utilities.getFilter('Airport.AirportId', associateAirport?.id) ]
      : [];
    const airportFilter = airport?.id
      ? Utilities.getFilter('Airport.AirportId', airport?.id)
      : Utilities.getFilter('ICAO', this.props.params?.icao || '');

    const mergedFilters = isAssociatedAirports
      ? associateAirportFilter.concat(airportTypeFilter)
      : [ airportFilter ].concat(airportTypeFilter);

    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify(mergedFilters),
      sortCollection: JSON.stringify([
        { propertyName: 'CAPPSSequenceId', isAscending: true, sequenceNumber: 1 },
        { propertyName: 'AirportHoursType.Name', isAscending: true, sequenceNumber: 2 },
      ]),
    };

    this.airportHoursStore
      .loadAirportHours(request)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        if (isAssociatedAirports) {
          // Auto Assign new capps sequence Id's
          this.airportHoursStore.associatedAirportHours = response.results;
          const seqIdsList = response.results.map(x => x.cappsSequenceId).sort();
          const maxValue = seqIdsList.length ? Math.max(...seqIdsList) : 0;
          if (maxValue) {
            this.airportHoursStore.airportHours = this.airportHoursStore.airportHours.map((x, idx) => {
              x.cappsSequenceId = maxValue + idx + 1;
              return x;
            });
          }
        } else {
          this.airportHoursStore.associatedAirportHours = [];
          this.airportHoursStore.airportHours = response.results;
        }
        response.results = this.airportHoursStore.airportHours.concat(this.airportHoursStore.associatedAirportHours);
        this.airportHoursGridRef?.setTableData(response);
      });
  }

  /* istanbul ignore next */
  private setAirportHoursSubTypes(airportHoursId: number): void {
    this.airportHourSubTypes = this.airportSettingsStore.airportHourSubTypes.filter(({ airportHoursType }) =>
      Utilities.isEqual(airportHoursType.id, airportHoursId)
    );
  }

  // Initialize Airport Hour with default values add airport hours model
  /* istanbul ignore next */
  private addNewAirportHour(): void {
    const airportHoursType: AirportHoursTypeModel = this.getField('airportHoursType').value;
    const isCIQTypeHours: boolean = Utilities.isEqual(airportHoursType.label, 'ciq');
    const airportHoursSubType = isCIQTypeHours
      ? this.airportHourSubTypes.find(({ label }) => Utilities.isEqual(label, 'Available Hours')) // SET default 74215
      : null;

    const newAirportHour = new AirportHoursModel({
      id: 0,
      airportHoursSubType: airportHoursSubType as AirportHoursSubTypeModel,
      airportHoursType,
      airport: this.getField('airport').value,
    });
    this.airportHoursGridRef?.addNewAirportHour(newAirportHour);
  }

  /* istanbul ignore next */
  private confirmCreateOtOrRecords(airportHour: AirportHoursModel, rowIndex: number): void {
    ModalStore.open(
      <ConfirmDialog
        title="Create OTOR Records"
        message="Do you want to create OT/OR Hours with this Airport Hour?"
        yesButton="Yes"
        noButton="No"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          this.createOTORRecords(airportHour, rowIndex);
        }}
      />
    );
  }

  /* istanbul ignore next */
  private createOTORRecords(airportHour: AirportHoursModel, rowIndex: number): void {
    ModalStore.open(
      <OtOrHoursDetails
        airportHoursModel={airportHour}
        airportHoursStore={this.airportHoursStore}
        airportSettingsStore={this.airportSettingsStore}
        updateGridItem={(otorHours: AirportHoursModel[]) => {
          this.airportHoursStore.airportHours = [ ...this.airportHoursStore.airportHours, ...otorHours ];
          const { gridPagination } = this.airportHoursGridRef;
          this.airportHoursGridRef.setTableData({
            ...gridPagination,
            results: this.airportHoursStore.airportHours,
            totalNumberOfRecords: gridPagination.totalNumberOfRecords + otorHours.length,
          });
        }}
      />
    );
  }

  /* istanbul ignore next */
  private confirmAirportAssociation(): void {
    const { airport, associateAirport } = this.form.values();
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Changes"
        message={`All Airport Hours with code ${airport.icao.label} will be associated to airport ${associateAirport.displayCode}. Are you sure you want to continue?`}
        yesButton="Yes"
        noButton="No"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          UIStore.setPageLoader(true);
          const airports = [ ...this.airportHoursStore.airportHours ].map(x => {
            x.airport = associateAirport;
            return x.serialize();
          });
          this.airportHoursStore
            .upsertAirportHours(airports)
            .pipe(
              finalize(() => UIStore.setPageLoader(false)),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (response: AirportHoursModel[]) => {
                this.airportHoursStore.associatedAirportHours = [];
                this.getField('airport').set(associateAirport);
                if (this.props.navigate) {
                  const { airportHoursTypeId, viewMode } = this.props.params as Params;
                  const backNav = this.props.searchParams?.get('backNav');
                  const url = `/airports/airport-hours/${associateAirport.id}/${associateAirport.displayCode}/${airportHoursTypeId}/${viewMode}?backNav=${backNav}`;
                  this.props.navigate(url, { replace: true });
                }
                this.getField('associateAirport').clear();
              },
              error: error => AlertStore.critical(error.message),
            });
        }}
      />
    );
  }

  /* istanbul ignore next */
  private saveChanges(airportHour: AirportHoursModel, rowIndex: number): void {
    UIStore.setPageLoader(true);
    this.airportHoursStore
      .upsertAirportHours([ airportHour.serialize() ])
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: AirportHoursModel[]) => {
          this.airportHoursGridRef?.updateTableItem(rowIndex, response[0]);
          if (this.airportHoursStore.canCreateOTORRecord(airportHour)) {
            this.confirmCreateOtOrRecords(airportHour, rowIndex);
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  private get airportHoursGrid(): ReactNode {
    const classes = this.props.classes as IClasses;
    const airport = this.getField('airport').value;

    if (!this.hasAirportAndAirportHoursType) {
      return (
        <div className={classes.placeHolder}>
          <DescriptionOutlined fontSize="large" />
          <Typography variant="subtitle1">Select ICAO and Hours Type </Typography>
          <Typography variant="body2">
            Please Select ICAO and Hours Type to edit Hours and related information
          </Typography>
        </div>
      );
    }

    return (
      <>
        <div className={classes.headerTitle}>
          <div className={classes.headerDetails}>
            <Typography>Hours Details</Typography>
            <ExpandCollapseButton onExpandCollapse={() => this.airportHoursGridRef?.autoSizeColumns()} />
          </div>
          <IconButton onClick={() => (this.expandMode = !this.expandMode)}>
            <AspectRatio />
          </IconButton>
        </div>
        <div className={classes.hoursGrid}>
          <AirportHoursGrid
            ref={this.hoursGridRef}
            isEditable={this.isEditable}
            airportModel={airport}
            columnResizeSource={this.columnResizeSource}
            airportHourSubTypes={this.airportHourSubTypes}
            onColumnResized={(source: string) => (this.columnResizeSource = source)}
            airportHoursType={this.getField('airportHoursType').value}
            onSaveChanges={(airportHours: AirportHoursModel, rowIndex: number) =>
              this.saveChanges(airportHours, rowIndex)
            }
          />
        </div>
      </>
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    const airport = this.getField('airport').value;
    const { airportId, icao, viewMode } = this.props.params as Params;
    const backNav = this.isAirportScreen ? `/upsert/${airportId}/${icao}/details/airport-hours` : '/airport-hours';
    return (
      <div className={classes.root}>
        <div className={classes.backButton}>
          <CustomLinkButton
            to={`/airports${backNav}`}
            title={this.isAirportScreen ? 'Airport Details' : 'Airport Hours'}
            startIcon={<ArrowBack />}
          />
        </div>
        <Paper className={classes.container}>
          <AirportHeaderSection
            viewMode={viewMode}
            isEditing={this.isEditable}
            isLoading={this.loader.isLoading}
            wingsAirports={this.airportHoursStore.wingsAirports}
            airportHourTypes={this.airportSettingsStore.airportHourTypes}
            isDisabled={this.airportHoursGridRef?.isProcessing}
            onAddNewAirport={() => this.addNewAirportHour()}
            getField={fieldKey => this.getField(fieldKey)}
            onViewModeChange={viewMode => this.setViewMode(viewMode)}
            onValueChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
            onSearchAirport={searchValue => this.searchWingsAirports(searchValue).subscribe()}
            onAssociateAirport={this.confirmAirportAssociation.bind(this)}
          />
          <ViewPermission hasPermission={this.hasAirportAndAirportHoursType && !this.expandMode}>
            <AirportHoursInformation
              airport={airport}
              airportHours={this.airportHoursStore.summaryHours}
              defaultActiveTab={this.activeTab}
              onTabChange={activeTab => (this.activeTab = activeTab)}
            />
          </ViewPermission>
          <div className={classes.gridContainer}>{this.airportHoursGrid}</div>
        </Paper>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(AirportHoursDetails));
export { AirportHoursDetails as PureAirportHoursDetails };

import React, { ReactNode } from 'react';
import { IBaseModuleProps, VIEW_MODE } from '@wings/shared';
import { Routes, Route } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import {
  AirportGeneralInformation,
  AirportHoursDetails,
  FlightPlanInformation,
  OperationalInformation,
  Ownership,
  AirportRunway,
  AirportRunwayDetails,
  AirportFrequency,
  TimezoneInformation,
  CustomDetails,
  AirportSecurity,
  AirportRunwayClosure,
  VendorLocations,
} from '../../Components';
import { AirportStore, airportSidebarOptions, AirportModuleSecurity, AirportModel } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { NavigateFunction } from 'react-router';
import {
  UIStore,
  withRouter,
  IAPIGridRequest,
  ViewPermission,
  UnsubscribableComponent,
  Utilities,
} from '@wings-shared/core';
import { ProtectedRoute } from '@wings-shared/layout';

interface RouteProps extends IBaseModuleProps {
  navigate?: NavigateFunction;
  params?: { viewMode: VIEW_MODE; airportId: number; icao: string };
  airportStore?: AirportStore;
}

@inject('sidebarStore', 'airportStore')
@observer
export class UpsertAirport<Props extends RouteProps> extends UnsubscribableComponent<Props> {
  private get airportBasePath(): string {
    if (this.props.params?.airportId) {
      const { airportId, icao, viewMode } = this.props.params;
      return icao ? `airports/upsert/${airportId}/${icao}/${viewMode}` : `airports/upsert/${airportId}/${viewMode}`;
    }
    return 'airports/upsert/new';
  }

  private get airportId(): number {
    return Utilities.getNumberOrNullValue(this.props.params?.airportId) as number;
  }

  private get airportStore(): AirportStore {
    return this.props.airportStore as AirportStore;
  }

  componentDidMount() {
    this.props.sidebarStore?.setNavLinks(airportSidebarOptions(false, !Boolean(this.airportId)), this.airportBasePath);
    this.loadAirport();
  }

  componentWillUnmount() {
    // if url contain airport id then clear
    if (this.props.params?.airportId) {
      this.airportStore.selectedAirport = null;
    }
  }

  /* istanbul ignore next */
  private loadAirport(): void {
    if (!this.airportId || this.airportStore.selectedAirport?.id) {
      this.setHasLoaded(true);
      return;
    }
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      filterCollection: JSON.stringify([{ propertyName: 'AirportId', propertyValue: this.airportId }]),
    };
    UIStore.setPageLoader(true);
    this.airportStore
      .getAirports(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        // restrict edit view for inactive airports 62982
        if (!response.results[0]?.isActive) {
          const { params } = this.props as Required<Props>;
          this.props.navigate &&
            this.props.navigate(
              `/airports/upsert/${params?.airportId}/${params?.icao}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`
            );
        }
        this.airportStore.selectedAirport = response.results[0];
        this.setHasLoaded(true);
      });
  }

  public render(): ReactNode {
    const viewMode = this.props.params?.viewMode;
    return (
      <ViewPermission hasPermission={this.hasLoaded}>
        <Routes>
          <Route index element={<AirportGeneralInformation />} />
          <Route path="airport-hours" element={<AirportHoursDetails key={'airport-hours'} />} />
          <Route path="operational-information" element={<OperationalInformation />} />
          <Route path="flight-plan-information" element={<FlightPlanInformation />} />
          <Route path="ownership" element={<Ownership />} />
          <Route path="runway" element={<AirportRunway />} />
          <Route path="runwayClosure" element={<AirportRunwayClosure />} />
          <Route
            path="runway/new"
            key="new"
            element={
              <ProtectedRoute
                element={<AirportRunwayDetails viewMode={viewMode} key={'new-runway'} />}
                hasPermission={AirportModuleSecurity.isEditable}
                redirectPath={'/airports'}
              />
            }
          />
          <Route
            path="runway/:runwayId/:runwayViewMode"
            key="details-runway"
            element={<AirportRunwayDetails viewMode={viewMode} key={'runway-details'} />}
          />
          <Route path="airport-frequencies" element={<AirportFrequency />} />
          <Route
            path="timezone-information"
            element={<TimezoneInformation airport={this.airportStore.selectedAirport as AirportModel} />}
          />
          <Route path="airport-security" element={<AirportSecurity />} />
          <Route path="vendor-locations" element={<VendorLocations />} />
          <Route path="custom-detail/*" element={<CustomDetails />} />
        </Routes>
      </ViewPermission>
    );
  }
}

export default withRouter(UpsertAirport);

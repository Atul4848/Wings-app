// navigation icons
import React, { FC, useEffect } from 'react';
import { ProtectedRoute } from '@wings-shared/layout';
import { AssociatedBulletins, IBaseModuleProps, NO_SQL_COLLECTIONS, UpsertBulletin, VIEW_MODE } from '@wings/shared';
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
  VendorLocations,
  AirportRunwayClosure,
} from '../../Components';
import {
  AirportStore,
  airportSidebarOptions,
  AirportModel,
  useAirportModuleSecurity,
  updateAirportSidebarOptions,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { UIStore, IAPIGridRequest, ViewPermission } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AirportPermissions, UpsertAirportPermission } from '../AirportPermissions';

interface Props extends Partial<IBaseModuleProps> {
  airportStore?: AirportStore;
}

const UpsertAirport: FC<Props> = props => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _airportStore = props.airportStore as AirportStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  const airportBasePath = (): string => {
    const { airportId, icao, viewMode } = params;
    if (airportId) {
      return icao ? `airports/upsert/${airportId}/${icao}/${viewMode}` : `airports/upsert/${airportId}/${viewMode}`;
    }
    return 'airports/upsert/new';
  };

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(airportSidebarOptions(false, !Boolean(params.airportId)), airportBasePath());
    loadAirport();
    return () => {
      if (params?.airportId) {
        _airportStore.selectedAirport = null;
      }
    };
  }, []);

  /* istanbul ignore next */
  const loadAirport = (): void => {
    if (!params.airportId || _airportStore.selectedAirport?.id) {
      unsubscribe.setHasLoaded(true);
      return;
    }
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      filterCollection: JSON.stringify([{ propertyName: 'AirportId', propertyValue: params.airportId }]),
    };
    UIStore.setPageLoader(true);
    _airportStore
      .getAirports(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        // restrict edit view for inactive airports 62982
        if (!response.results[0]?.isActive) {
          params.navigate &&
            navigate(`/airports/upsert/${params?.airportId}/${params?.icao}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`);
        }
        _airportStore.selectedAirport = response.results[0];
        props.sidebarStore?.setNavLinks(
          airportSidebarOptions(
            false,
            !Boolean(params.airportId),
            !Boolean(response.results[0]?.customs?.customsDetailId)
          ),
          airportBasePath()
        );
        unsubscribe.setHasLoaded(true);
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<AirportGeneralInformation />} />
        <Route path="airport-hours" element={<AirportHoursDetails key={'airport-hours'} />} />
        {/* Airport Permission Routes */}
        <Route path="airport-permissions" element={<AirportPermissions />} />
        <Route
          path="airport-permissions/:permissionViewMode"
          element={<UpsertAirportPermission viewMode={params.viewMode as VIEW_MODE} key={'new-permission'} />}
        />
        <Route
          path="airport-permissions/:permissionId/:permissionViewMode"
          element={<UpsertAirportPermission viewMode={params.viewMode as VIEW_MODE} key={'edit-permission'} />}
        />
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
              element={<AirportRunwayDetails viewMode={params.viewMode as VIEW_MODE} key={'new-runway'} />}
              hasPermission={airportModuleSecurity.isEditable}
              redirectPath={'/airports'}
            />
          }
        />
        <Route
          path="runway/:runwayId/:runwayViewMode"
          key="details-runway"
          element={<AirportRunwayDetails viewMode={params.viewMode as VIEW_MODE} key={'runway-details'} />}
        />
        <Route path="airport-frequencies" element={<AirportFrequency />} />
        <Route
          path="timezone-information"
          element={<TimezoneInformation airport={_airportStore.selectedAirport as AirportModel} />}
        />
        <Route path="airport-security" element={<AirportSecurity />} />
        <Route path="vendor-locations" element={<VendorLocations />} />
        <Route
          path="associated-bulletins"
          element={
            <AssociatedBulletins
              updateAirportSidebarOptions={updateAirportSidebarOptions}
              airportBasePath={airportBasePath}
              collectionName={NO_SQL_COLLECTIONS.AIRPORT_BULLETIN}
              title={_airportStore.selectedAirport?.title}
            />
          }
        />
        <Route
          path="associated-bulletins/:bulletinId/:viewMode"
          element={
            <UpsertBulletin
              key={'associated-bulletin-details'}
              updatedSidebarOptions={() =>
                updateAirportSidebarOptions('Associated Bulletins', !Boolean(params.airportId))
              }
              basePath={airportBasePath()}
              securityModule={airportModuleSecurity}
              isAssociatedBulletins={true}
            />
          }
        />
        <Route path="custom-detail/*" element={<CustomDetails />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'airportStore')(observer(UpsertAirport));

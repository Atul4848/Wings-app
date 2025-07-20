import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';
import { AuthStore } from '@wings-shared/security';
import {
  AirportHours,
  AirportHoursDetails,
  AirportMapping,
  AirportMappingBeta,
  FAAImport,
  FAAImportRoutes,
  Settings,
  CoreModule,
  AirportHoursReview,
  CustomGeneralInfoReview,
  MilitaryFieldsReview,
  AirportParkingReview,
  AirportDataExport,
  AirportHoursReviewDetails,
} from './Modules';
import { UpsertAirport } from './Modules/Core';
import { ProtectedRoute } from '@wings-shared/layout';
import { NotFoundPage, SearchStore } from '@wings-shared/core';
import { Bulletins, IBaseModuleProps, NO_SQL_COLLECTIONS, UpsertBulletin, BulletinsReview } from '@wings/shared';
import { airportSidebarOptions, updatedAirportSidebarOptions, useAirportModuleSecurity } from './Modules/Shared';

const AirportsApp = (props: IBaseModuleProps) => {
  const redirectPath: string = '/airports';
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    AuthStore.configureAgGrid();
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="airports/*">
        <Route index element={<CoreModule />} />
        <Route path="upsert/:viewMode/*" element={<UpsertAirport key={'airport-details-add-update'} />} />
        <Route
          path="upsert/:airportId/:viewMode/*"
          element={<UpsertAirport key={'airport-details-add-update-no-icao'} />}
          key="airport-details-add-update-no-icao"
        />
        <Route
          path="upsert/:airportId/:icao/:viewMode/*"
          element={<UpsertAirport key={'airport-icao-details-add-update'} />}
          key="airport-icao-details-add-update"
        />
        <Route path="airport-hours" element={<AirportHours />} />
        <Route path="import-faa" element={<FAAImport />} />
        <Route path="import-faa/:id/:processId/*" element={<FAAImportRoutes />} />
        <Route
          path="airport-hours/:viewMode"
          key="new"
          element={
            <ProtectedRoute
              hasPermission={airportModuleSecurity.isEditable}
              redirectPath={redirectPath}
              element={<AirportHoursDetails key={'airport-hours-new'} />}
            />
          }
        />
        <Route
          path="airport-hours/:airportId/:icao/new" // Required when user comes from airport screen
          key="new-with-icao"
          element={
            <ProtectedRoute
              element={<AirportHoursDetails key={'airport-hours-new-with-icao'} />}
              hasPermission={airportModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="airport-hours/:airportId/:icao/:airportHoursTypeId/:viewMode/*"
          key=""
          element={<AirportHoursDetails key={'airport-hours-from-airport-screen'} />}
        />
        <Route
          path="airport-hours/:icao/:airportHoursTypeId/:viewMode/*"
          key="details"
          element={<AirportHoursDetails key={'airport-hour-details'} />}
        />
        <Route path="airport-mappings" element={<AirportMapping />} />
        <Route path="airport-mappings-beta" element={<AirportMappingBeta />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="bulletins"
          element={
            <Bulletins
              defaultSidebarOptions={airportSidebarOptions}
              securityModule={airportModuleSecurity}
              collectionName={NO_SQL_COLLECTIONS.AIRPORT_BULLETIN}
              basePath="/airports"
            />
          }
        />
        <Route
          path="bulletins/:viewMode"
          element={
            <UpsertBulletin
              updatedSidebarOptions={() => updatedAirportSidebarOptions('Bulletins')}
              defaultSidebarOptions={airportSidebarOptions}
              securityModule={airportModuleSecurity}
              basePath="/airports"
              key={'bulletins-view'}
            />
          }
        />
        <Route
          path="bulletins/:bulletinId/:viewMode"
          key="bulletin-details"
          element={
            <UpsertBulletin
              updatedSidebarOptions={() => updatedAirportSidebarOptions('Bulletins')}
              defaultSidebarOptions={airportSidebarOptions}
              key={'bulletin-details'}
              securityModule={airportModuleSecurity}
              basePath="/airports"
            />
          }
        />
        <Route
          path="purged-bulletins"
          element={
            <Bulletins
              purgedBulletins={true}
              defaultSidebarOptions={airportSidebarOptions}
              securityModule={airportModuleSecurity}
              basePath="/airports"
              key={'purged-bulletins'}
            />
          }
        />
        <Route
          path="purged-bulletins/:purgedBulletinId/:viewMode"
          element={
            <UpsertBulletin
              purgedBulletins={true}
              updatedSidebarOptions={() => updatedAirportSidebarOptions('Purged Bulletins')}
              defaultSidebarOptions={airportSidebarOptions}
              securityModule={airportModuleSecurity}
              basePath="/airports"
              key={'purged-bulletin-details'}
            />
          }
        />
        <Route
          path="bulletins-review"
          element={
            <BulletinsReview
              isAirport={true}
              securityModule={airportModuleSecurity}
              key={'airport-bulletin-review'}
              defaultSidebarOptions={airportSidebarOptions}
              basePath="/airports"
            />
          }
        />
        <Route path="airport-hour-review" element={<AirportHoursReview />} />
        <Route
          path="airport-hour-review/:id/:airportHourId/review-details"
          element={<AirportHoursReviewDetails key={'airport-hour-review-details'} />}
        />
        <Route path="custom-general-info-review" element={<CustomGeneralInfoReview />} />
        <Route path="airport-military-review" element={<MilitaryFieldsReview />} />
        <Route path="airport-parking-review" element={<AirportParkingReview />} />
        <Route path="airport-data-export" element={<AirportDataExport />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(AirportsApp));

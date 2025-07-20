// navigation icons
import { NotFoundPage, SearchStore } from '@wings-shared/core';
import { ProtectedRoute, SidebarStore } from '@wings-shared/layout';
import { useModeStore } from '@wings-shared/mode-store';
import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  ImportWorldEvents,
  UpsertEvent,
  TimeConversion,
  CoreModule,
  AirportTimeZones,
  TimeZoneReview,
  AirportTimeZoneReview,
  EventModule,
  Settings,
  AirportTimeZoneMapping,
  WorldEventsReview,
  Hotels,
  Suppliers,
  UpsertSupplier,
  UpsertHotel,
} from './Modules';
interface Props {
  sidebarStore?: typeof SidebarStore;
}

const TimeZoneApp = (props: IBaseModuleProps) => {
  const redirectPath: string = '/geographic/events';
  const modeStore = useModeStore();
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;

  /* istanbul ignore next */
  useEffect(() => {
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="geographic/*">
        <Route index element={<Navigate to="events" />} />
        <Route
          path="time-conversion"
          element={
            <ProtectedRoute
              element={<TimeConversion />}
              hasPermission={modeStore.isDevModeEnabled}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="time-zones" element={<CoreModule />} />
        <Route path="airport-time-zones" element={<AirportTimeZones />} />
        <Route path="time-zone-review" element={<TimeZoneReview />} />
        <Route path="airport-time-zone-review" element={<AirportTimeZoneReview />} />
        <Route path="airport-time-zone-mapping" element={<AirportTimeZoneMapping />} />
        <Route path="settings" element={<Settings />} />
        <Route path="events" element={<EventModule />} />
        <Route path="world-events-review" element={<WorldEventsReview />} />
        <Route path="events/:viewMode" element={<UpsertEvent basePath={''} />} />
        <Route path="events-import" element={<ImportWorldEvents />} />
        <Route
          path="events/:eventId/:viewMode"
          key="events-details"
          element={<UpsertEvent key={'upsert-event-edit'} basePath={''} />}
        />
        <Route path="hotels" element={<Hotels />} />
        <Route path="hotels/:viewMode" element={<UpsertHotel basePath={''} />} />
        <Route
          path="hotels/:hotelId/:viewMode"
          key="hotel-details"
          element={<UpsertHotel key={'upsert-hotel-edit'} basePath={''} />}
        />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/:viewMode" element={<UpsertSupplier key="supplier-add" />} />
        <Route
          path="suppliers/:supplierId/:viewMode"
          key="suppliers-details"
          element={<UpsertSupplier key="supplier-edit" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(TimeZoneApp));

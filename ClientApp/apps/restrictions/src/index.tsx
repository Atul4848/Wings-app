import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { HealthAuth, Settings, HealthVendor, ScheduleRestriction, AircraftOperatorRestriction } from './Modules';
import { IBaseModuleProps } from '@wings/shared';
import { AuthStore } from '@wings-shared/security';
import { Routes, Route } from 'react-router-dom';
import { HealthVendorEditor } from './Modules/HealthVendor';
import { UpsertAircraftOperatorRestriction } from './Modules/AircraftOperatorRestriction';
import { useRestrictionModuleSecurity } from './Modules/Shared';
import { NotFoundPage, SearchStore } from '@wings-shared/core';
import { ProtectedRoute } from '@wings-shared/layout';
// eslint-disable-next-line max-len
import UpsertScheduleRestrictions from './Modules/ScheduleRestrictions/UpsertScheduleRestrictions/UpsertScheduleRestrictions';

const HealthAuthLazyRoutes = React.lazy(() =>
  import(
    /* webpackChunkName: "healthAuthorization" */
    './Modules/HealthAuthorization/Components/HealthAuthorizationRoutes/HealthAuthorizationRoutes'
  )
);

const RestrictionApp = (props: IBaseModuleProps) => {
  const redirectPath: string = '/restrictions';
  const restrictionModuleSecurity = useRestrictionModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    AuthStore.configureAgGrid();
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="restrictions/*">
        <Route index element={<HealthAuth />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="health-authorization/:viewMode/*"
          key="healthAuthorizationAdd"
          element={
            <ProtectedRoute
              element={
                <HealthAuthLazyRoutes
                  basePath={`${props.basePath}/health-authorization`}
                  key={'health-authorization-add'}
                />
              }
              hasPermission={restrictionModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="health-authorization/:id/:viewMode/*"
          element={
            <HealthAuthLazyRoutes
              basePath={`${props.basePath}/health-authorization`}
              key={'health-authorization-edit'}
            />
          }
        />
        <Route path="health-vendor" element={<HealthVendor />} />
        <Route
          path="health-vendor/:mode"
          element={
            <ProtectedRoute
              element={<HealthVendorEditor key={'health-vendors'} />}
              hasPermission={restrictionModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="health-vendor/:id/:mode" element={<HealthVendorEditor key={'health-vendor-edit'} />} />
        <Route path="schedule-restrictions" element={<ScheduleRestriction />} />
        <Route
          path="schedule-restrictions/:viewMode"
          element={<UpsertScheduleRestrictions key={'schedule-restrictions'} />}
        />
        <Route
          path="schedule-restrictions/:scheduleRestrictionId/:viewMode"
          key="schedule-restrictions-details"
          element={<UpsertScheduleRestrictions key={'schedule-restrictions-edit'} />}
        />
        <Route path="aircraft-operator-restrictions" element={<AircraftOperatorRestriction />} />
        <Route
          path="aircraft-operator-restrictions/:viewMode"
          element={<UpsertAircraftOperatorRestriction key={'aircraft-operator-restriction'} />}
        />
        <Route
          path="aircraft-operator-restrictions/:id/:viewMode"
          key="aircraft-operator-restrictions"
          element={<UpsertAircraftOperatorRestriction key="aircraft-operator-restrictions-edit" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(RestrictionApp));

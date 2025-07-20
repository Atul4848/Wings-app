import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';
import { IBaseModuleProps } from '@wings/shared';
import {
  AircraftRegistry,
  sidebarMenu,
  Settings,
  Airframe,
  AirframeEditor,
  AircraftRegistryEditor,
  AircraftVariation,
  AircraftVariationEditor,
  EtpPolicy,
  EtpPolicyEditor,
  EtpScenario,
  AddEtpScenario,
  FlightPlan,
  FlightPlanEditor,
  FlightPlanFormatChangeRecord,
  FlightPlanningService,
  GenericRegistry,
  Performance,
  PerformanceEditor,
  UpsertAirframe
} from './Modules/index';
import { useAircraftModuleSecurity } from './Modules/Shared';
import { ProtectedRoute } from '@wings-shared/layout';
import { NotFoundPage, SearchStore } from '@wings-shared/core';
import { useModeStore } from '@wings-shared/mode-store';

const AircraftApp = (props: IBaseModuleProps) => {
  const redirectPath: string = '/aircraft';
  const modeStore = useModeStore();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="aircraft/*">
        <Route index element={<FlightPlan />} />
        <Route path="etp-scenario" element={<EtpScenario />} />
        <Route
          path="etp-scenario/new"
          element={
            <ProtectedRoute
              element={<AddEtpScenario />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="settings" element={<Settings />} />
        <Route
          path="flight-plan/:mode"
          element={
            <ProtectedRoute
              element={<FlightPlanEditor key={'flight-plan-add'} />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="flight-plan/:id/:mode" element={<FlightPlanEditor key={'flight-plan-edit'} />} />
        <Route
          path="change-records"
          element={<FlightPlanFormatChangeRecord key={'flight-plan--format-change-record'} />}
        />
        <Route path="performance" element={<Performance />} />
        <Route
          path="performance/:mode"
          element={
            <ProtectedRoute
              element={<PerformanceEditor key={'performance-add'} />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="performance/:id/:mode" element={<PerformanceEditor key={'performance-edit'} />} />
        <Route path="etp-policy" element={<EtpPolicy key={'etp-policy'} />} />
        <Route
          path="etp-policy/:mode"
          element={
            <ProtectedRoute
              element={<EtpPolicyEditor key={'etp-policy-add'} />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="etp-policy/:id/:mode" element={<EtpPolicyEditor key={'etp-policy-edit'} />} />
        <Route path="aircraft-variation" element={<AircraftVariation key="aircraftVariation" />} />
        <Route
          path="aircraft-variation/:mode"
          element={
            <ProtectedRoute
              element={<AircraftVariationEditor key={'aircraft-variation-add'} />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="aircraft-variation/:id/:mode"
          element={<AircraftVariationEditor key={'aircraft-variation-edit'} />}
        />
        <Route path="airframe" element={<Airframe />} />
        <Route path="airframe/:mode" key="airframeNew" element={<UpsertAirframe key="airframe-new" />} />
        <Route path="airframe/:id/:mode/*" element={<UpsertAirframe key="airframe-details" />} />
        <Route
          path="aircraft-registry"
          element={
            <ProtectedRoute
              element={<AircraftRegistry />}
              hasPermission={modeStore.isDevModeEnabled}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="aircraft-registry/:mode"
          element={
            <ProtectedRoute
              element={<AircraftRegistryEditor key={'aircraft-add'} />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="aircraft-registry/:id/:mode"
          element={
            <ProtectedRoute
              element={<AircraftRegistryEditor key={'aircraft-edit'} />}
              hasPermission={aircraftModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="generic-registry" element={<GenericRegistry />} />
        <Route path="flight-planning-service" element={<FlightPlanningService />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(AircraftApp));

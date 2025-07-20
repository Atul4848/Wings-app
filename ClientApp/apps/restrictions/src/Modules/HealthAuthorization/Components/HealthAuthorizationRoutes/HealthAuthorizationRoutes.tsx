import React, { FC, useEffect } from 'react';
import { IBaseModuleProps } from '@wings/shared';
import { Route, Routes, useParams } from 'react-router-dom';
import {
  EntryRequirement,
  ChangeRecord,
  QuarantineRequirement,
  VaccinationRequirement,
  HealthAuthorizationGeneral,
  StayRequirement,
  DomesticMeasure,
  HealthAuthorizationGeneralInformation,
  ExitRequirement,
  TraveledHistory,
} from '../index';
import { inject, observer } from 'mobx-react';
import { HealthAuthStore, sidebarOptions } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { IAPIGridRequest, UIStore, ViewPermission } from '@wings-shared/core';
import { InfoPaneStore, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './HealthAuthorizationRoutes.style';

interface Props extends IBaseModuleProps {
  sidebarStore?: typeof SidebarStore;
  healthAuthStore?: HealthAuthStore;
}

const HealthAuthRouteModule: FC<Props> = ({ ...props }: Props) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;

  useEffect(() => {
    if (params?.id) {
      loadSelectedHealthAuthorizationData(Number(params.id));
      return;
    }
    unsubscribe.setHasLoaded(true);
    props.sidebarStore?.setNavLinks(
      sidebarOptions(true),
      `restrictions/health-authorization/${params?.viewMode?.toLowerCase()}`
    );
    return () => {
      InfoPaneStore.close();
      _healthAuthStore?.setSelectedGeneralInfoField({});
    };
  });

  const openInPaneMode = (): void => {
    const { selectedGeneralInfoField } = _healthAuthStore as HealthAuthStore;
    InfoPaneStore.open(
      <div className={classes?.infoContent}>
        <div dangerouslySetInnerHTML={{ __html: selectedGeneralInfoField.value }}></div>
      </div>
    );
  };

  const loadSelectedHealthAuthorizationData = (id: number): void => {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      filterCollection: JSON.stringify([{ propertyName: 'HealthAuthorizationId', propertyValue: id }]),
    };
    _healthAuthStore
      ?.getHealthAuthById(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _healthAuthStore.selectedHealthAuth = response.results[0];
        unsubscribe.setHasLoaded(true);
        props.sidebarStore?.setNavLinks(
          sidebarOptions(true, false),
          `restrictions/health-authorization/${id}/${params?.viewMode?.toLowerCase()}`
        );
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<HealthAuthorizationGeneral />} key="healthAuthorizationOverview" />
        <Route path="vaccination-requirement" element={<VaccinationRequirement />} key="vaccinationRequirement" />
        <Route
          path="general"
          element={<HealthAuthorizationGeneralInformation openInfoPane={() => openInPaneMode()} />}
          key="HealthAuthorizationGeneral"
        />
        <Route path="change-records" element={<ChangeRecord />} key="changeRecords" />
        <Route path="entry-requirement" element={<EntryRequirement />} key="EntryRequirement" />
        <Route path="exit-requirement" element={<ExitRequirement />} key="ExitRequirement" />
        <Route path="stay-requirement" element={<StayRequirement />} key="StayRequirement" />
        <Route path="quarantine-requirement" element={<QuarantineRequirement />} key="changeRecords" />
        <Route path="domestic-measure" element={<DomesticMeasure />} />
        <Route path="traveled-history" element={<TraveledHistory />} key="traveledHistory" />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'healthAuthStore')(observer(HealthAuthRouteModule));

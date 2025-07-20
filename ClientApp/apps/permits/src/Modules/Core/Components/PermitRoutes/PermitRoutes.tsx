import React, { FC, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { Route, Routes } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { PermitModel, PermitStore, sidebarOptions, usePermitModuleSecurity } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AdditionalInfo,
  PermitExceptionUpsert,
  PermitGeneralUpsert,
  PermitRequirements,
  PermitLeadTimesUpsert,
  PermitValidity,
  DMNotes,
} from '../../Components';
import { useNavigate, useParams } from 'react-router';
import { IAPIGridRequest, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface RouteProps {
  sidebarStore?: typeof SidebarStore;
  permitStore?: PermitStore;
}

const PermitRouteModule: FC<RouteProps> = ({ sidebarStore, permitStore }: RouteProps) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _permitStore = permitStore as PermitStore;
  const permitModuleSecurity = usePermitModuleSecurity();

  /* istanbul ignore next */
  const permitId = (): Number => {
    return Utilities.getNumberOrNullValue(params?.permitId || '') as number;
  };

  const viewMode = (): string => {
    return params?.viewMode?.toLowerCase() || '';
  };

  /* istanbul ignore next */
  const permitDataModel = (): PermitModel => {
    return _permitStore?.permits.find((permit: PermitModel) => permit.id === permitId()) as PermitModel;
  };

  /* istanbul ignore next */
  useEffect(() => {
    if (!permitModuleSecurity.isEditable) {
      navigate(`/permits/${permitId()}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`);
    }
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    if (Boolean(permitId())) {
      loadPermitById();
      return;
    }
    unsubscribe.setHasLoaded(true);
    sidebarStore?.setNavLinks(sidebarOptions(true, true, VIEW_MODE.NEW), `permits/${VIEW_MODE.NEW.toLowerCase()}`);
  };

  /* istanbul ignore next */
  const loadPermitById = (): void => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      filterCollection: JSON.stringify([{ propertyName: 'PermitId', propertyValue: permitId() }]),
    };
    UIStore.setPageLoader(true);
    _permitStore
      ?.getPermits(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(() => {
        _permitStore?.setPermitDataModel(new PermitModel({ ...permitDataModel() }));
        unsubscribe.setHasLoaded(true);
        sidebarStore?.setNavLinks(sidebarOptions(true, false, VIEW_MODE.EDIT), `permits/${permitId()}/${viewMode()}`);
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<PermitGeneralUpsert />} key="PermitGeneralUpsert" />
        <Route path="exceptions" element={<PermitExceptionUpsert />} key="permitExceptions" />
        <Route path="lead-times" element={<PermitLeadTimesUpsert />} key="permitLeadTimes" />
        <Route path="validity" element={<PermitValidity />} key="permitValidity" />
        <Route path="additional-info" element={<AdditionalInfo />} key="permitAdditionalInfo" />
        <Route path="requirements" element={<PermitRequirements />} key="permitRequirements" />
        <Route path="dm-note" key="dm-note" element={<DMNotes />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'permitStore')(observer(PermitRouteModule));

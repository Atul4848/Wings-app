import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AssociatedCustomers, RegistryModel, RegistryStore, registryOptions } from '../../../Shared';
import { RegistryGeneralInformation, CustomsDecal, AssociatedAirframe } from '../index';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, ViewPermission } from '@wings-shared/core';

interface Props extends Partial<IBaseModuleProps> {
  registryStore?: RegistryStore;
}

const UpsertRegistry: FC<Props> = props => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const registryId = Number(params.registryId);
  const _registryStore = props.registryStore as RegistryStore;
  const registryTitle = _registryStore.selectedRegistry.name;

  /* istanbul ignore next */
  const registryBasePath = () => {
    return params?.registryId
      ? `customer/registry/${registryId}/${params.viewMode}`
      : 'customer/registry/new';
  };

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(registryOptions(!Boolean(params?.registryId)), registryBasePath());
    loadRegistry();
    return () => {
      _registryStore.selectedRegistry = new RegistryModel();
    };
  }, []);

  /* istanbul ignore next */
  const loadRegistry = (): void => {
    if (!registryId) {
      unsubscribe.setHasLoaded(true);
      return;
    }
    UIStore.setPageLoader(true);
    _registryStore
      .getRegistryById(registryId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _registryStore.selectedRegistry = response;
        unsubscribe.setHasLoaded(true);
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<RegistryGeneralInformation key="registry-info" title={registryTitle} />} />
        <Route
          path="associated-customers"
          element={
            <AssociatedCustomers title={registryTitle} backNavTitle="Registry" backNavLink="/customer/registry" />
          }
        />
        <Route
          path="customs-decal"
          element={<CustomsDecal title={registryTitle} backNavTitle="Registry" backNavLink="/customer/registry" />}
        />
        <Route path="associated-airframe" element={<AssociatedAirframe title={registryTitle} />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'registryStore')(observer(UpsertRegistry));

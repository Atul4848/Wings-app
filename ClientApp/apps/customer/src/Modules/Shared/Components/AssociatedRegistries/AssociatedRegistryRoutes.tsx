import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { associatedRegistrySidebarOptions, customerSidebarOptions } from '../../Components';
import { UIStore, ViewPermission } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { useParams } from 'react-router';
import AssociatedRegistryGeneralUpsert from './AssociatedRegistryGeneralUpsert/AssociatedRegistryGeneralUpsert';
import RegistrySites from './RegistrySites/RegistrySites';
import { CustomerStore, RegistryStore } from '../../Stores';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AssociatedRegistriesModel } from '../../Models';

interface Props extends Partial<IBaseModuleProps> {
  sidebarStore?: typeof SidebarStore;
  customerStore?: CustomerStore;
  registryStore?: RegistryStore;
}

const AssociatedRegistryRoutes: FC<Props> = ({ registryStore, customerStore, sidebarStore }: Props) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const customerNumber = params.customerNumber;
  const _registryStore = registryStore as RegistryStore;
  const _customerStore = customerStore as CustomerStore;

  /* istanbul ignore next */
  const associatedRegistryBasePath = () => {
    return params?.registryId
      ? `customer/upsert/${customerNumber}/${params.viewMode}/associated-registries/${params.registryId}/${params.registryViewMode}`
      : `customer/upsert/${customerNumber}/${params.viewMode}/associated-registries/new`;
  };

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(
      associatedRegistrySidebarOptions(!Boolean(params?.registryId)),
      associatedRegistryBasePath()
    );
    loadInitialData();
    return () => {
      sidebarStore?.setNavLinks(
        customerSidebarOptions(false, true),
        `customer/upsert/${customerNumber}/${params.viewMode}`
      );
      _registryStore.selectedAssociatedRegistry = new AssociatedRegistriesModel();
      _registryStore.registryList = [];
    };
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    if (!params.registryId) {
      return;
    }
    UIStore.setPageLoader(true);
    _registryStore
      .getAssociatedRegistryById(_customerStore.selectedCustomer?.number, Number(params.registryId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _registryStore.selectedAssociatedRegistry = response;
      });
  };

  return (
    <ViewPermission hasPermission={true}>
      <Routes>
        <Route index element={<AssociatedRegistryGeneralUpsert key="AssociatedRegistryGeneralUpsert" />} />
        <Route path="sites" element={<RegistrySites />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'customerStore', 'registryStore')(observer(AssociatedRegistryRoutes));

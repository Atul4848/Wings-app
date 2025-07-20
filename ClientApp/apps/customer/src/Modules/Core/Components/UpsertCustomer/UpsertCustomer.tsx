import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  AssociatedOffice,
  AssociatedOperators,
  AssociatedRegistries,
  AssociatedRegistryRoutes,
  AssociatedSites,
  AssociatedSitesRoutes,
  AssociatedSpecialCare,
  CustomerModel,
  CustomerStore,
  customerSidebarOptions,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { IAPIGridRequest, UIStore, ViewPermission } from '@wings-shared/core';
import { useParams } from 'react-router';
import { CustomerGeneralInformation, ManageRegistries } from '../index';
import ExternalMappings from '../ExternalMappings/ExternalMappings';
// eslint-disable-next-line max-len
import UpsertExternalCustomerMapping from '../../../ExternalCustomerMappings/UpsertExternalCustomerMapping/UpsertExternalCustomerMapping';
import CustomerProfile from '../CustomerProfile/CustomerProfile';

interface Props extends Partial<IBaseModuleProps> {
  customerStore?: CustomerStore;
}

const UpsertCustomer: FC<Props> = props => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const customerNumber = params.customerNumber;
  const _customerStore = props.customerStore as CustomerStore;
  const customerTitle = _customerStore.selectedCustomer.name;
  const customerBasePath = `customer/upsert/${customerNumber}/${params.viewMode}`;

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(customerSidebarOptions(false, true), customerBasePath);
    loadCustomer();
    return () => {
      _customerStore.selectedCustomer = new CustomerModel();
    };
  }, []);

  /* istanbul ignore next */
  const loadCustomer = (): void => {
    if (!customerNumber) {
      unsubscribe.setHasLoaded(true);
      return;
    }
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ propertyName: 'Number', propertyValue: customerNumber }]),
    };
    _customerStore
      .getCustomerNoSqlById(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _customerStore.selectedCustomer = response;
        unsubscribe.setHasLoaded(true);
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<CustomerGeneralInformation key="customer-info" title={customerTitle} />} />
        <Route
          path="associated-registries"
          element={<AssociatedRegistries title={customerTitle} backNavTitle="Customer" backNavLink="/customer" />}
        />
        <Route
          path="associated-registries/:registryViewMode"
          key="associatedRegistryNew"
          element={<AssociatedRegistryRoutes key="associated-registries-new" />}
        />
        <Route
          path="associated-registries/:registryId/:registryViewMode/*"
          element={<AssociatedRegistryRoutes key="associated-registries-edit" />}
        />
        <Route
          path="associated-operators"
          element={<AssociatedOperators title={customerTitle} backNavTitle="Customer" backNavLink="/customer" />}
        />
        <Route
          path="associated-office"
          element={<AssociatedOffice title={customerTitle} backNavTitle="Customer" backNavLink="/customer" />}
        />
        <Route
          path="associated-bill-to-sites"
          element={<AssociatedSites title={customerTitle} backNavTitle="Customer" backNavLink="/customer" />}
        />
        <Route
          path="associated-bill-to-sites/:siteId/:siteViewMode/*"
          element={<AssociatedSitesRoutes basePath="" />}
        />
        <Route
          path="associated-special-care"
          element={<AssociatedSpecialCare title={customerTitle} backNavTitle="Customer" backNavLink="/customer" />}
        />
        <Route
          path="manage-registries"
          element={<ManageRegistries title={customerTitle} backNavTitle="Customer" backNavLink="/customer" />}
        />
        <Route
          path="external-customer-mappings"
          element={
            <ExternalMappings
              title={customerTitle}
              backNavTitle="Customer"
              backNavLink={`/${customerBasePath}`}
              customerPartyId={_customerStore.selectedCustomer?.partyId}
            />
          }
        />
        <Route
          path="external-customer-mappings/:viewMode"
          key="external-customer-mappings-new"
          element={
            <UpsertExternalCustomerMapping
              backNavLink={`/${customerBasePath}`}
              defaultCustomer={_customerStore.selectedCustomer}
            />
          }
        />
        <Route
          path="external-customer-mappings/:externalCustomerMappingId/:viewMode"
          key="external-customer-mappings-edit-details"
          element={
            <UpsertExternalCustomerMapping
              backNavLink={`/${customerBasePath}`}
              defaultCustomer={_customerStore.selectedCustomer}
            />
          }
        />
        <Route
          path="customer-profile"
          element={
            <CustomerProfile
              backNavTitle="Customer"
              backNavLink="/customer"
              defaultCustomer={_customerStore.selectedCustomer}
              customerPartyId={_customerStore.selectedCustomer?.partyId}
            />
          }
        />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'customerStore')(observer(UpsertCustomer));

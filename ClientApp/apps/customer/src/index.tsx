import { SearchStore, NotFoundPage } from '@wings-shared/core';
import { AuthStore } from '@wings-shared/security';
import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { ContactCommsGeneralInfo } from './Modules/Shared';
import { Routes, Route } from 'react-router';
import {
  Operator,
  Settings,
  Registry,
  UpsertCustomer,
  Contacts,
  Communications,
  ImportCustomsDecal,
  ExternalCustomerMappings,
  UpsertExternalCustomerMapping,
  Team,
  TeamMembers,
} from './Modules';
import { UpsertRegistry } from './Modules/Registry/Components';
import { UpsertOperator } from './Modules/Operator/Components';
import { UpsertTeam } from './Modules/Team/Components';

const CoreModule = React.lazy(() =>
  import(
    /* webpackChunkName: "customer-core-module" */
    './Modules/Core/Core.module'
  )
);

const CustomerApp = (props: IBaseModuleProps) => {
  /* istanbul ignore next */
  useEffect(() => {
    AuthStore.configureAgGrid();
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="customer/*">
        <Route index element={<CoreModule />} />
        <Route path="upsert/:customerNumber/:viewMode/*" element={<UpsertCustomer key="customer-details" />} />
        <Route path="registry" element={<Registry />} />
        <Route path="registry/:viewMode" key="registryNew" element={<UpsertRegistry key="registry-new" />} />
        <Route path="registry/:registryId/:viewMode/*" element={<UpsertRegistry key="registry-details" />} />
        <Route path="operator" element={<Operator />} />
        <Route path="operator/:operatorId/:viewMode/*" element={<UpsertOperator key="operator-details" />} />

        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:viewMode" key="contacts-new" element={<ContactCommsGeneralInfo />} />
        <Route
          path="contacts/:contactId/communication/:communicationId/:viewMode"
          key="contacts-edit-details"
          element={<ContactCommsGeneralInfo />}
        />

        <Route path="communications" element={<Communications />} />
        <Route
          path="communications/:viewMode"
          key="communication-new"
          element={<ContactCommsGeneralInfo isCommunicationView={true} />}
        />
        <Route
          path="communications/:communicationId/contact/:contactId/:viewMode"
          key="communication-edit-details"
          element={<ContactCommsGeneralInfo isCommunicationView={true} />}
        />

        <Route path="external-customer-mappings" element={<ExternalCustomerMappings />} />
        <Route
          path="external-customer-mappings/:viewMode"
          key="external-customer-mappings-new"
          element={<UpsertExternalCustomerMapping backNavLink="/customer/external-customer-mappings" />}
        />
        <Route
          path="external-customer-mappings/:externalCustomerMappingId/:viewMode"
          key="external-customer-mappings-edit-details"
          element={<UpsertExternalCustomerMapping backNavLink="/customer/external-customer-mappings" />}
        />
        <Route path="import-customs-decal" element={<ImportCustomsDecal />} />
        <Route path="team" element={<Team />} />
        <Route path="team-members" element={<TeamMembers />} />
        <Route path="team/:viewMode" key="teamNew" element={<UpsertTeam key="team-new" />} />
        <Route path="team/:teamId/:viewMode/*" element={<UpsertTeam key="team-details" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(CustomerApp));

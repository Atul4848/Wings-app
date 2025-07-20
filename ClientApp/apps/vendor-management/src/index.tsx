import { IBaseModuleProps } from '@wings/shared';
import { inject } from 'mobx-react';
import React, { Component, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CoreModule } from './Modules';
import {
  AuthStore,
  MODULE_ACTIONS,
  ModulePermissions,
  SettingsModuleSecurity,
  USER_GROUP,
} from '@wings-shared/security';
import VendorLocationGrid from './Modules/VendorLocationGrid/VendorLocationGrid';
import VendorSettings from './Modules/VendorSettings/VendorSettings';
import { NotFoundPage } from '@wings-shared/core';
import { VmsModuleSecurity } from './Modules/Shared';
import VendorPricing from './Modules/VendorPricing/VendorPricing';
import ContactMaster from './Modules/ContactMaster/ContactMaster';
import UpsertVendor from './Modules/VendorLevelGrid/Components/UpsertVendor';
import UpsertLocation from './Modules/VendorLocationGrid/Components/UpsertLocation';
import { sidebarMenus } from './Modules/Shared/Components/SidebarMenu/SidebarMenu';
import Approvals from './Modules/Approvals/Approvals';
import DirectoryCode from './Modules/DirectoryCode/DirectoryCode';
import LocationOnBoardingApprovals from './Modules/LocationOnBoardingApprovals/LocationOnBoardingApprovals';
const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.VENDOR_MANAGEMENT_ADMIN, USER_GROUP.ADMIN ],
};


@inject('sidebarStore')
class VendorManagementApp extends Component<IBaseModuleProps> {
  constructor(props) {
    super(props);
    this.props.sidebarStore.setNavLinks(sidebarMenus, this.props.basePath);
    VmsModuleSecurity.init();
    SettingsModuleSecurity.updatePermissions(permissions);
    AuthStore.configureAgGrid();
  }


  private get hasPermission(): boolean {
    return AuthStore.user?.isAdminUser || AuthStore.user?.isVendorManagementAdmin;
  }

  public render(): ReactNode {
    return (
      <Routes basename={this.props.basePath}>
        <Route path="vendor-management/*">
          <Route index element={<CoreModule />} />
          <Route path="upsert/:viewMode/*" element={<UpsertVendor />} />
          <Route
            path="upsert/:vendorId/:vendorCode/:viewMode/*"
            element={<UpsertVendor />}
            key="vendor-details-add-update"
          />
          <Route path="vendor-location/*" element={<VendorLocationGrid />} />
          <Route path="settings" element={<VendorSettings />} />
          <Route path="vendor-location/:operationCode/:vendorId/:viewMode/*" element={<UpsertLocation />} />
          <Route path="vendor-location/:operationCode/:viewMode/*" element={<UpsertLocation />} />
          <Route
            path="vendor-location/:operationCode/:vendorId/:id/:viewMode/*"
            element={<UpsertLocation />}
            key="vendor-location-add-update"
          />
          {/* <Route
            path="vendor-location/:vendorId/:id/:vendorCode/:viewMode/*"
            element={<UpsertLocation />}
            key="vendor-details-location-add-update"
          /> */}
          <Route path="vendor-pricing" element={<VendorPricing />} />
          <Route path="vendor-contact" element={<ContactMaster />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="location-onboarding-approvals" element={<LocationOnBoardingApprovals />} />
          <Route path="directory-code" element={<DirectoryCode />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    );
  }
}
export default VendorManagementApp;

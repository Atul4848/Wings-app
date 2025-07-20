import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useStyles } from './UpsertVendor.styles';
import VendorGeneralInformation from './VendorGeneralInformation/VendorGeneralInformation';
import VendorLocation from './VendorLocation/VendorLocation';
import VendorAddress from './VendorAddress/VendorAddress';
import { Route, Routes, useParams } from 'react-router';
import { INavigationLink, SidebarStore } from '@wings-shared/layout';
import StoreOutlinedIcon from '@material-ui/icons/StoreOutlined';
import {
  AddressBookIcon,
  MapPointerIcon,
  PhoneIcon,
  DocumentIcon,
  MissionAdvisorIcon,
  InfoIcon,
  PaymentsIcon,
} from '@uvgo-shared/icons';
import { VendorManagmentModel } from '../../Shared';
import VendorAssociate from './VendorAssociate/VendorAssociate';
import VendorDocument from './VendorDocument/VendorDocument';
import UltimateOwnership from './UltimateOwnership/UltimateOwnership';
import VendorUser from './VendorUser/VendorUser';
import UpsertVendorUser from './UpsertVendorUser/UpsertVendorUser';
import BankInformation from './BankInformation/BankInformation';
import VendorServicesPricing from './VendorServicesPricing/VendorServicesPricing';

const sidebarMenus = (disable: boolean): INavigationLink[] => [
  {
    to: '',
    title: 'General Information',
    icon: <StoreOutlinedIcon />,
  },
  {
    to: 'vendor-location',
    title: 'Location Details',
    icon: <MapPointerIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-contact',
    title: 'Contact Details',
    icon: <PhoneIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-address',
    title: 'Addresses',
    icon: <AddressBookIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-document',
    title: 'Documents',
    icon: <DocumentIcon />,
    isDisabled: disable,
  },
  {
    to: 'ultimate-ownership',
    title: 'Ownership',
    icon: <MissionAdvisorIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-user',
    title: 'User',
    icon: <MissionAdvisorIcon />,
    isDisabled: disable,
  },
  {
    to: 'bank-information',
    title: 'Bank Information',
    icon: <InfoIcon />,
    isDisabled: disable,
  },
  {
    to: 'pricing',
    title: 'Pricing',
    icon: <PaymentsIcon />,
    isDisabled: disable,
  },
];

const UpsertVendor = () => {
  const params = useParams();
  const classes = useStyles();
  const [ selectedVendor, setSelectedVendor ] = useState(new VendorManagmentModel());

  const { vendorId, vendorCode, viewMode, userId, vendorUserId } = params;

  const getBasePath = (): string => {
    if (vendorId) {
      return `vendor-management/upsert/${vendorId}/${vendorCode}/${viewMode.toLocaleLowerCase()}`;
    }
    return 'vendor-management/upsert/new';
  };

  useEffect(() => {
    SidebarStore.setNavLinks(sidebarMenus(vendorId ? false : true), getBasePath());
  }, [ viewMode ]);

  return (
    <Routes>
      <Route index element={<VendorGeneralInformation setSelectedVendor={setSelectedVendor} />} />
      <Route path="vendor-location" element={<VendorLocation viewMode={viewMode} vendorData={selectedVendor} />} />
      <Route
        path="vendor-contact"
        element={
          <VendorAssociate vendorData={selectedVendor} setSelectedVendor={setSelectedVendor} viewMode={viewMode} />
        }
      />
      <Route
        path="vendor-address"
        element={<VendorAddress vendorId={vendorId} setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route
        path="vendor-document"
        element={<VendorDocument vendorId={vendorId} setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route
        path="ultimate-ownership"
        element={<UltimateOwnership vendorId={vendorId} setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route
        path="vendor-user"
        element={<VendorUser vendorId={vendorId} setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route
        path="vendor-email/:upsert/*"
        element={<UpsertVendorUser setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route
        path="vendor-email/:upsert/:userViewMode/*"
        element={<UpsertVendorUser setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route
        path="bank-information"
        element={<BankInformation vendorId={vendorId} setSelectedVendor={setSelectedVendor} viewMode={viewMode} />}
      />
      <Route path="pricing" element={<VendorServicesPricing />} />
    </Routes>
  );
};
export default inject('settingsStore', 'sidebarStore')(observer(UpsertVendor));

import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from './UpsertLocation.styles';
import VendorLocationGeneralInformation from './VendorLocationGeneralInformation/VendorLocationGeneralInformation';
import { Route, Routes, useParams } from 'react-router';
import { INavigationLink, SidebarStore } from '@wings-shared/layout';
import StoreOutlinedIcon from '@material-ui/icons/StoreOutlined';

import {
  PhoneIcon,
  AddressBookIcon,
  DocumentIcon,
  MissionAdvisorIcon,
  ClockIcon,
  FlightPlansNewIcon,
  PaymentsIcon,
  ServiceIcon,
  InfoIcon,
  WarningIcon,
} from '@uvgo-shared/icons';
import LocationContact from './LocationContact/LocationContact';
import { useVMSModuleSecurity, VendorLocationModel } from '../../Shared';
import LocationAddress from './LocationAddress/LocationAddress';
import LocationDocument from './LocationDocument/LocationDocument';
import LocationOperationalEssential from './LocationOperationalEssential/LocationoperationalEssential';
import UltimateOwnership from './UltimateOwnership/UltimateOwnership';
import LocationHours from './LocationHours/LocationHours';
import ServicesPricing from './ServicesPricing/ServicesPricing';
import LocationA2G from './LocationA2G/LocationA2G';
import { IClasses } from '@wings-shared/core';
import GroundServiceProvider from './GroundServiceProvider/GroundServiceProvider';
import LocationBankInformation from './BankInformation/LocationBankInformation';
import LocationOperationalInsights from './LocationOperationalInsights/LocationOperationalInsights';
import OrderSoftware from './OrderSoftware/OrderSoftware';
import ApprovalChanges from './ServicesPricing/ApprovalChanges';
import LocationAssociatedBulletins from './LocationAssociatedBulletins/LocationAssociatedBulletins';


interface Props {
  classes: IClasses;
}
const sidebarMenus = (disable: boolean): INavigationLink[] => [
  {
    to: '',
    title: 'General Information',
    icon: <StoreOutlinedIcon />,
  },
  {
    to: 'location-contact',
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
    to: 'vendor-location-document',
    title: 'Documents',
    icon: <DocumentIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-location-operational-essential',
    title: 'Operational Essential',
    icon: <StoreOutlinedIcon />,
    isDisabled: disable,
  },
  {
    to: 'ultimate-ownership',
    title: 'Ownership',
    icon: <MissionAdvisorIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-location-hours',
    title: 'Hours',
    icon: <ClockIcon />,
    isDisabled: disable,
  },
  {
    to: 'services-pricing',
    title: 'Services and Pricing',
    icon: <PaymentsIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-location-a2g',
    title: 'UA Agent Details',
    icon: <FlightPlansNewIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-location-ground-service-provider',
    title: 'Ground Service Providers',
    icon: <ServiceIcon />,
    isDisabled: disable,
  },
  {
    to: 'bank-information',
    title: 'Bank Information',
    icon: <InfoIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-location-operational-insights',
    title: 'Operational Insights',
    icon: <InfoIcon />,
    isDisabled: disable,
  },
  {
    to: 'order-software-details',
    title: 'Order Software details',
    icon: <DocumentIcon />,
    isDisabled: disable,
  },
  {
    to: 'vendor-location-bulletins',
    title: 'Associated Bulletins',
    icon: <WarningIcon />,
    isDisabled: disable,
  },
];

const UpsertLocation: FC<Props> = ({ classes }) => {
  const params = useParams();
  const [ selectedVendor, setSelectedVendor ] = useState(new VendorLocationModel());
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const { id, viewMode, operationCode, vendorId } = params;

  const getBasePath = (): string => {
    if (id) {
      return operationCode === 'upsert'
        ? `/vendor-management/vendor-location/upsert/${vendorId}/${id}/${viewMode.toLocaleLowerCase()}`
        : `/vendor-management/vendor-location/${operationCode}/${vendorId}/${id}/${viewMode.toLocaleLowerCase()}`;
    }
    return operationCode === 'upsert'
      ? '/vendor-management/vendor-location/upsert/new'
      : `/vendor-management/vendor-location/${operationCode}/${vendorId}/new`;
  };

  useEffect(() => {
    SidebarStore.setNavLinks(sidebarMenus(id ? false : true), getBasePath());
  }, [ viewMode ]);

  return (
    <Routes>
      <Route index element={<VendorLocationGeneralInformation setSelectedVendor={setSelectedVendor} />} />
      <Route path="location-contact" element={<LocationContact vendorData={selectedVendor} viewMode={viewMode} />} />
      <Route
        path="vendor-address"
        element={<LocationAddress vendorData={selectedVendor} viewMode={viewMode} id={id} vendorId={vendorId} />}
      />
      <Route
        path="vendor-location-document"
        element={<LocationDocument vendorData={selectedVendor} viewMode={viewMode} id={id} vendorId={vendorId} />}
      />
      <Route
        path="vendor-location-operational-essential"
        element={<LocationOperationalEssential id={id} vendorId={vendorId} viewMode={viewMode} />}
      />
      <Route
        path="ultimate-ownership"
        element={
          <UltimateOwnership 
            vendorLocationId={params.id} 
            setSelectedVendor={setSelectedVendor} 
            viewMode={viewMode} 
          />
        }
      />
      <Route
        path="services-pricing"
        element={
          // <LocationHours />
          <ServicesPricing />
        }
      />
      <Route
        path="services-pricing/approval-changes"
        element={
          <ApprovalChanges />
        }
      />
      <Route path="vendor-location-hours" element={<LocationHours />} />
      <Route path="vendor-location-bulletins" element={<LocationAssociatedBulletins />} />
      <Route path="vendor-location-a2g" element={<LocationA2G id={id} vendorId={vendorId} viewMode={viewMode} />} />
      <Route path="vendor-location-ground-service-provider" element={<GroundServiceProvider />} />
      <Route
        path="bank-information"
        element={
          <LocationBankInformation
            vendorData={selectedVendor}
            vendorId={vendorId}
            id={id}
            viewMode={viewMode}
          />
        }
      />
      <Route
        path="vendor-location-operational-insights"
        element={<LocationOperationalInsights id={id} vendorId={vendorId} viewMode={viewMode} />}
      />
      <Route
        path="order-software-details"
        element={
          <OrderSoftware
            vendorId={vendorId}
            id={id}
            viewMode={viewMode}
          />
        }
      />
    </Routes>
  );
};
export default inject('settingsStore', 'sidebarStore')(withStyles(styles)(observer(UpsertLocation)));

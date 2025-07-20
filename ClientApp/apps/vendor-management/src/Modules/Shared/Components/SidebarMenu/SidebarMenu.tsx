import React from 'react';
import { INavigationLink } from '@wings-shared/layout';
import StoreOutlinedIcon from '@material-ui/icons/StoreOutlined';
import { MapPointerIcon, SettingIcon, PhoneIcon, EyeIcon } from '@uvgo-shared/icons';
import { ModeStore } from '@wings-shared/mode-store';

export const sidebarMenus: INavigationLink[] = [
  {
    to: '',
    title: 'Vendors',
    icon: <StoreOutlinedIcon />,
  },
  {
    to: 'vendor-location',
    title: 'Vendor Location',
    icon: <MapPointerIcon />,
  },
  {
    to: 'vendor-pricing',
    title: 'Vendor Pricing',
    icon: <StoreOutlinedIcon />,
  },
  {
    to: 'vendor-contact',
    title: 'Contacts',
    icon: <PhoneIcon />,
  },
  {
    to: 'approvals',
    title: 'Approvals',
    icon: <EyeIcon />,
  },
  ...(ModeStore.isDevModeEnabled
    ? [
      {
        to: 'location-onboarding-approvals',
        title: 'Location On Boarding Approval',
        icon: <EyeIcon />,
      },
    ]
    : []),
  {
    to: 'settings',
    title: 'Settings',
    icon: <SettingIcon />,
  },
  {
    to: 'directory-code',
    title: 'Directory Code',
    icon: <PhoneIcon />,
  }
];
import React from 'react';
import { MenuItem } from '@wings-shared/layout';
import { Utilities } from '@wings-shared/core';

export const sidebarOptions = (isHealthAuth: boolean, isDisabled: boolean = true): MenuItem[] =>
  isHealthAuth ? healthAuthorizationOptions(isDisabled) : restrictionsOptions;

const restrictionsOptions: MenuItem[] = [
  {
    to: '',
    title: 'Health Authorization',
    icon: 'HealthAuthIcon',
  },
  {
    to: 'health-vendor',
    title: 'Health Vendor',
    isHidden: false,
    icon: 'HealthVendorIcon',
  },
  {
    to: 'schedule-restrictions',
    title: 'Schedule Restrictions',
    icon: 'ClockIcon',
  },
  {
    to: 'aircraft-operator-restrictions',
    title: 'Aircraft Operator Restrictions',
    icon: 'WarningIcon',
  },
  {
    to: 'settings',
    title: 'Settings',
    icon: 'SettingIcon',
  },
];

const healthAuthorizationOptions = (isDisabled: boolean): MenuItem[] => [
  {
    to: '',
    title: 'Overview',
    icon: 'BriefCaseIcon',
  },
  {
    to: 'general',
    title: 'General Requirement',
    icon: 'InfoIcon',
    isDisabled,
  },
  {
    to: 'entry-requirement',
    title: 'Entry Requirement',
    icon: 'EntranceIcon',
    isDisabled,
  },
  {
    to: 'quarantine-requirement',
    title: 'Quarantine Requirement',
    icon: 'QuarantineIcon',
    isDisabled,
  },
  {
    to: 'vaccination-requirement',
    title: 'Vaccination Requirement',
    icon: 'VaccineIcon',
    isDisabled,
  },
  {
    to: 'stay-requirement',
    title: 'Stay Requirement',
    icon: 'StayHomeIcon',
    isDisabled,
  },
  {
    to: 'exit-requirement',
    title: 'Exit Requirement',
    icon: 'ExitIcon',
    isDisabled,
  },
  {
    to: 'domestic-measure',
    title: 'Domestic Measure',
    icon: 'ExitIcon',
    isDisabled,
  },
  {
    to: 'traveled-history',
    title: 'Traveled History',
    icon: 'HistoryIcon',
    isDisabled,
  },
  {
    to: 'change-records',
    title: 'Change Records',
    icon: 'TriangleIcon',
    isDisabled,
  },
];

export const updateRestrictionSidebarOptions = (tabQuery: string): MenuItem[] =>
  Utilities.updateSidebarOptions(restrictionsOptions, tabQuery);

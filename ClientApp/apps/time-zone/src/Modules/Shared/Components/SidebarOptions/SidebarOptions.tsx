import { Utilities } from '@wings-shared/core';
import { MenuItem } from '@wings-shared/layout';

export const sidebarMenu: MenuItem[] = [
  { to: 'time-conversion', title: 'Time Conversion', icon: 'ArrowTopBottomIcon', isHidden: true },
  {
    to: 'airport-time-zones',
    title: 'Airport Time Zones',
    icon: 'AirplaneIcon',
  },
  {
    to: 'airport-time-zone-review',
    title: 'Airport Time Zone Review',
    icon: 'EyeIcon',
  },
  {
    to: 'airport-time-zone-mapping',
    title: 'Airport Time Zone Mapping',
    icon: 'LinkIcon',
  },
  { to: 'time-zones', title: 'Time Zones', icon: 'ClockIcon' },
  {
    to: 'time-zone-review',
    title: 'Time Zone Review',
    icon: 'EyeIcon',
  },
  { to: 'events', title: 'World Events', icon: 'CalendarIcon' },
  { to: 'world-events-review', title: 'World Events Review', icon: 'EyeIcon' },
  { to: 'events-import', title: 'Import World Events ', icon: 'UploadIcon' },
  { to: 'hotels', title: 'Hotels', icon: 'OfficeIcon' },
  { to: 'suppliers', title: 'Suppliers', icon: 'PeopleIcon' },
  { to: 'settings', title: 'Settings', icon: 'SettingIcon' },
];

export const updateTimezoneSidebarOptions = (tabQuery: string): MenuItem[] =>
  Utilities.updateSidebarOptions(sidebarMenu, tabQuery) as MenuItem[];

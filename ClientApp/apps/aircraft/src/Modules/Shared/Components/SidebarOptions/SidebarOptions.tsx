import { Utilities } from '@wings-shared/core';
import { MenuItem } from '@wings-shared/layout';

export const sidebarMenu: MenuItem[] = [
  { to: '', title: 'Flight Plan Format', icon: 'AirplaneIcon' },
  { to: 'change-records', title: 'Change Record', icon: 'TriangleIcon' },
  { to: 'etp-scenario', title: 'ETP Scenario', icon: 'ClockIcon' },
  { to: 'etp-policy', title: 'ETP Policy', icon: 'EtpPolicyIcon' },
  { to: 'performance', title: 'Performance', icon: 'PerformanceIcon' },
  {
    to: 'aircraft-variation',
    title: 'Aircraft Variation',
    icon: 'AircraftVariationIcon',
  },
  {
    to: 'airframe',
    title: 'Airframe',
    icon: 'AirframeIcon',
  },
  {
    to: 'aircraft-registry',
    title: 'Aircraft Registry',
    isHidden: true,
    icon: 'AircraftVariationIcon',
  },
  {
    to: 'generic-registry',
    title: 'Generic Registry',
    icon: 'ListIcon',
  },
  {
    to: 'flight-planning-service',
    title: 'Flight Planning Services',
    icon: 'ListIcon',
  },
  {
    to: 'settings',
    title: 'Settings',
    icon: 'SettingIcon',
  },
];

const updateSidebarOptions = (options: MenuItem[], tabQuery: string, searchQueryParams?: string): MenuItem[] => {
  const updateLinks = (links: MenuItem[]): MenuItem[] =>
    links.map(link =>
      link.title === tabQuery
        ? {
          ...link,
          to: window.location.pathname + (searchQueryParams ? searchQueryParams : ''),
        }
        : link.children
          ? { ...link, children: updateLinks(link.children) }
          : { ...link }
    );

  return updateLinks(options);
};

export const updateAircraftSidebarOptions = (tabQuery: string): MenuItem[] =>
  Utilities.updateSidebarOptions(sidebarMenu, tabQuery);

export const updateAirframeSidebarOptions = (tabQuery: string): MenuItem[] =>
  updateSidebarOptions(sidebarMenu, tabQuery);

export const airframeOptions = (isDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General-Information', icon: 'AirframeIcon' },
];

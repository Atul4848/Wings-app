import { INavigationLink, MenuItem } from '@wings-shared/layout';
import { Utilities } from '@wings-shared/core';

/* istanbul ignore next */
export const countrySidebarOptions = (defaultOptions: boolean, isDisabled: boolean = false): INavigationLink[] =>
  defaultOptions ? defaultCountryOptions : upsertCountryOptions(isDisabled);

export const upsertTabBasePathFinder = (paths: string[]) =>
  window.location.pathname
    .split('/')
    .filter(x => !paths.includes(x))
    .join('/');

export const upsertCountryBackNavLink = (idQuery: string | number) =>
  idQuery ? `/countries/continents/${idQuery}/countries` : '/countries';

/* istanbul ignore next */
export const updatedBackNavigation = (): { backNavTitle: string; updatedBackNavLink: string } => {
  const pathList = window.location.pathname.split('/');
  const slicedPathList = pathList.slice(0, pathList.length - 2); // Excluding the last two elements
  const titleQuery = slicedPathList[slicedPathList.length - 1];
  const backNavTitle = titleQuery[0]?.toUpperCase() + titleQuery.slice(1);
  const updatedBackNavLink = slicedPathList.join('/');
  return { updatedBackNavLink, backNavTitle };
};

export const countryReviewOptions = (): MenuItem[] => [
  { to: 'bulletins-review',  title: 'Bulletins' },
  { to: 'cabotage-review', title: 'Cabotage' },
];

export const defaultCountryOptions: MenuItem[] = [
  { to: '', title: 'Countries', icon: 'WorldIcon' },
  { to: 'states', title: 'States', icon: 'CountryFlagIcon' },
  { to: 'cities', title: 'Cities', icon: 'CityIcon' },
  {
    to: 'islands',
    title: 'Islands',
    icon: 'LandscapeIcon',
  },
  {
    to: 'continents',
    title: 'Continents',
    icon: 'TimeZoneIcon',
  },
  {
    to: 'firs',
    title: 'FIRs',
    icon: 'FirIcon',
  },
  {
    to: 'regions',
    title: 'Regions',
    icon: 'LocationSearchIcon',
  },
  {
    to: 'metros',
    title: 'Metros',
    icon: 'LocationIcon',
  },
  {
    to: 'aeronautical-information',
    title: 'AIP',
    icon: 'DocumentIcon',
  },
  { to: 'bulletins', title: 'Bulletins', icon: 'WarningIcon' },
  { to: 'purged-bulletins', title: 'Purged Bulletins', icon: 'WarningIcon' },
  {
    to: 'country-review',
    title: 'Country Review',
    icon: 'EyeIcon',
    isOpen: false,
    children: countryReviewOptions(),
  },
  { to: 'settings', title: 'Settings', icon: 'SettingIcon' },
];

export const upsertCountryOptions = (isDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  {
    to: 'operational-requirements',
    title: 'Operational Requirements',
    icon: 'LocationSearchIcon',
    isDisabled,
    isOpen: false,
    children: operationalRequirementsOptions(isDisabled),
  },
  { to: 'associated-regions', title: 'Associated Regions', icon: 'LocationSearchIcon', isDisabled },
  { to: 'associated-aips', title: 'Associated AIPs', icon: 'DocumentIcon', isDisabled },
  { to: 'associated-firs', title: 'Associated FIRs', icon: 'FirIcon', isDisabled },
];

export const operationalRequirementsOptions = (isDisabled: boolean): MenuItem[] => [
  { to: 'operational-requirements/general', title: 'General', isDisabled },
  { to: 'operational-requirements/cabotage', title: 'Cabotage', isDisabled },
  { to: 'operational-requirements/flight-planning', title: 'Flight Planning', isDisabled },
  {
    to: 'operational-requirements/customs',
    title: 'Customs',
    isDisabled,
  },
];

export const updateCountrySidebarOptions = (tabQuery: string): MenuItem[] =>
  Utilities.updateSidebarOptions(defaultCountryOptions, tabQuery);

export const upsertCountrySidebarOptions = (tabQuery: string, isDisabled: boolean): MenuItem[] =>
  Utilities.updateSidebarOptions(upsertCountryOptions(isDisabled), tabQuery);

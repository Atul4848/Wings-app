import { VIEW_MODE } from '@wings/shared';
import { MenuItem } from '@wings-shared/layout';
import { Utilities } from '@wings-shared/core';

/* istanbul ignore next */
export const sidebarOptions = (
  isInternalRoute: boolean,
  isDisabled: boolean = true,
  viewMode: VIEW_MODE = VIEW_MODE.NEW
): MenuItem[] => (isInternalRoute ? permitInternalRoutes(isDisabled, viewMode) : permitExternalRoutes);

const permitExternalRoutes: MenuItem[] = [
  {
    to: '',
    title: 'Permits',
    icon: 'BriefCaseIcon',
  },
  {
    to: 'permit-info-review',
    title: 'Permit Info Review',
    icon: 'EyeIcon',
  },
  { to: 'executeRules', title: 'Execute Rules', icon: 'PlayIcon' },
  { to: 'settings', title: 'Settings', icon: 'SettingIcon' },
];

/* istanbul ignore next */
const permitInternalRoutes = (isDisabled: boolean, viewMode: VIEW_MODE = VIEW_MODE.NEW): MenuItem[] => [
  {
    to: '',
    title: 'General',
    icon: 'InfoIcon',
  },
  {
    to: 'exceptions',
    title: 'Exceptions',
    icon: 'DocumentIcon',
    isDisabled,
  },
  {
    to: 'lead-times',
    title: 'Lead Times',
    icon: 'ClockIcon',
    isDisabled,
  },
  {
    to: 'validity',
    title: 'Validity',
    icon: 'CheckCircleIcon',
    isDisabled,
  },
  {
    to: 'additional-info',
    title: 'Additional Info',
    icon: 'AdditionalInfoIcon',
    isDisabled,
  },
  {
    to: 'requirements',
    title: 'Requirements',
    icon: 'DocumentIcon',
    isDisabled,
  },
  {
    to: 'dm-note',
    title: 'DM Note',
    icon: 'NoteIcon',
    isDisabled,
  },
];

export const updatePermitSidebarOptions = (tabQuery: string): MenuItem[] =>
  Utilities.updateSidebarOptions(permitExternalRoutes, tabQuery);

import React, { LazyExoticComponent, MouseEvent, ReactNode } from 'react';
import { IMainNavLink } from 'src/Components/MultiHeader/types';

import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import LocalAirportIcon from '@material-ui/icons/LocalAirportOutlined';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import StoreOutlined from '@material-ui/icons/StoreOutlined';
import WarningIcon from '@material-ui/icons/Warning';

import {
  AirportIcon,
  CountryFlagIcon,
  PeopleIcon,
  ReferenceDataIcon,
  TimeZoneIcon,
  TripsIcon,
  UserSettingIcon,
  VendorIcon,
} from '@uvgo-shared/icons';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { MODE_TYPES, ModeStore } from '@wings-shared/mode-store';
import { AuthStore, MODULE_NAMES } from '@wings-shared/security';
import { Route } from '@wings-shared/core';
import { computed } from 'mobx';

interface IModule {
  lazyComponent?: LazyExoticComponent<any>;
  path: string;
  name: MODULE_NAMES | string;
  menuIcon?: ReactNode;
  menuLabel?: string;
  allowRoute: boolean;
  externalLink?: string;
  isMenuButton?: boolean;
  childModules?: IModule[];
  getIsHeaderExpanded?: () => boolean;
  setIsHeaderExpanded?: () => boolean;
}

class ModuleStore {
  public readonly redirectPath: string = '/airports';
  private readonly env = new EnvironmentVarsStore();
  private _hideModuleSettings: string[] = [];

  constructor() {
    this._hideModuleSettings = this.getSettings();
  }

  /* istanbul ignore next */
  @computed
  private get _modules(): IModule[] {
    // UVGO
    // {
    //   path: 'uvgo',
    //   name: MODULE_NAMES.RESTRICTIONS,
    //   allowRoute: ModeStore.isDevModeEnabled,
    //   menuIcon: <UvGoIcon size="x-large" />,
    //   menuLabel: 'uvGO',
    //   externalLink: this.env.getVar(ENVIRONMENT_VARS.UVGO_WEBSITE),
    // },

    return [
      {
        path: 'reference-data',
        name: 'reference-data',
        allowRoute: true,
        menuIcon: <ReferenceDataIcon size="x-large" />,
        menuLabel: 'Reference Data',
        isMenuButton: true,
        childModules: [
          {
            path: 'airports',
            name: MODULE_NAMES.AIRPORTS,
            allowRoute: this.isModuleVisible(MODULE_NAMES.AIRPORTS),
            menuIcon: <AirportIcon size="medium" />,
            menuLabel: 'Airports',
          },
          {
            path: 'airport-logistics',
            name: MODULE_NAMES.AIRPORT_LOGISTICS,
            allowRoute: true,
            menuIcon: <AirportIcon size="medium" />,
            menuLabel: 'Airport Logistics',
          },
          {
            path: 'countries',
            name: MODULE_NAMES.COUNTRY,
            allowRoute: this.isModuleVisible(MODULE_NAMES.COUNTRY),
            menuIcon: <CountryFlagIcon size="medium" />,
            menuLabel: 'Country',
          },
          {
            path: 'geographic',
            name: MODULE_NAMES.GEOGRAPHIC,
            allowRoute: this.isModuleVisible(MODULE_NAMES.GEOGRAPHIC),
            menuIcon: <TimeZoneIcon size="medium" />,
            menuLabel: 'Geographic',
          },
          {
            path: 'permits',
            name: MODULE_NAMES.PERMITS,
            allowRoute: this.isModuleVisible(MODULE_NAMES.PERMITS),
            menuIcon: <TripsIcon size="medium" />,
            menuLabel: 'Permits',
          },
          {
            path: 'restrictions',
            name: MODULE_NAMES.RESTRICTIONS,
            allowRoute: this.isModuleVisible(MODULE_NAMES.RESTRICTIONS),
            menuIcon: <WarningIcon fontSize="inherit" />,
            menuLabel: 'Restrictions',
          },
        ],
      },
      {
        path: 'customer',
        name: 'customer',
        allowRoute: true,
        menuIcon: <PeopleIcon size="x-large" />,
        menuLabel: 'Customer',
        isMenuButton: true,
        childModules: [
          {
            path: 'aircraft',
            name: MODULE_NAMES.AIRCRAFT,
            allowRoute: true,
            menuIcon: <LocalAirportIcon fontSize="inherit" />,
            menuLabel: 'Aircraft',
          },
          {
            path: 'customer',
            name: MODULE_NAMES.CUSTOMER,
            allowRoute: true,
            menuIcon: <PeopleIcon size="medium" />,
            menuLabel: 'Customer',
          },
          {
            path: 'user-management',
            name: MODULE_NAMES.USER_MANAGEMENT,
            allowRoute: AuthStore.permissions.hasAnyRole([ 'um_reader', 'um_manager', 'um_admin' ]),
            menuIcon: <AccountCircleOutlinedIcon fontSize="inherit" />,
            menuLabel: 'User Management',
          },
        ],
      },
      {
        path: 'vendor',
        name: 'vendor',
        allowRoute: true,
        menuIcon: <VendorIcon size="x-large" />,
        menuLabel: 'Vendor',
        isMenuButton: true,
        childModules: [
          {
            path: 'vendor-management',
            name: MODULE_NAMES.VENDOR_MANAGEMENT,
            allowRoute: true,
            menuIcon: <StoreOutlined fontSize="inherit" />,
            menuLabel: 'Vendor Management',
          },
        ],
      },
      {
        path: 'admin',
        name: 'admin',
        allowRoute: true,
        menuIcon: <UserSettingIcon size="x-large" />,
        menuLabel: 'Admin',
        isMenuButton: true,
        childModules: [
          {
            path: 'notifications',
            name: MODULE_NAMES.NOTIFICATIONS,
            allowRoute: true,
            menuIcon: <NotificationsNoneIcon fontSize="inherit" />,
            menuLabel: 'Notifications',
          },
          {
            path: 'general',
            name: MODULE_NAMES.GENERAL,
            allowRoute: true,
            menuIcon: <DashboardRoundedIcon fontSize="inherit" />,
            menuLabel: 'General',
          },
        ],
      },
    ];
  }

  private getSubMenuList(modules): IMainNavLink[] {
    return modules
      .filter(menuItem => menuItem.allowRoute)
      .map(m => ({
        to: m.externalLink ? '/external-link' : `/${m.path}`,
        label: m.menuLabel,
        icon: m.menuIcon,
        // isVisible: m.allowRoute,
        isVisible: true,
        clicked: (event?: MouseEvent<HTMLAnchorElement>) => {
          if (m.externalLink) {
            event.preventDefault();
            window.open(m.externalLink);
          }
        },
        childLinks: m.childModules ? this.getSubMenuList(m.childModules) : [],
      }));
  }

  /* istanbul ignore next */
  @computed
  public get menuList(): IMainNavLink[] {
    return this._modules
      .filter(menuItem => menuItem.allowRoute)
      .map(m => ({
        to: m.externalLink ? '/external-link' : `/${m.path}`,
        label: m.menuLabel,
        icon: m.menuIcon,
        // isVisible: m.allowRoute,
        isVisible: true,
        clicked: (event?: MouseEvent<HTMLAnchorElement>) => {
          if (m.externalLink) {
            event.preventDefault();
            window.open(m.externalLink);
          }
        },
        isMenuButton: m?.isMenuButton,
        childLinks: m.childModules ? this.getSubMenuList(m.childModules) : [],
      }));
  }

  /* istanbul ignore next */
  public get lazyRoutes(): ReactNode[] {
    return this._modules.map(m => {
      const LazyComponent = m.lazyComponent as React.FC<{ basePath: string }>;
      return (
        <Route
          key={m.name}
          hasPermission={m.allowRoute}
          path={`${m.path}/*`}
          redirectPath={this.redirectPath}
          element={<LazyComponent basePath={m.path} />}
        />
      );
    });
  }

  // Tokenizer variable as comma separated string (i.e 'country, country.states') To ['country', 'country.states']
  private getSettings(): string[] {
    const settings = this.env.getVar(ENVIRONMENT_VARS.HIDDEN_MODULES) || '';
    return settings.toLocaleLowerCase().split(',');
  }

  // Get settings based on current module(country,airports) and return sub modules i.e [state, city, isLands]
  public hideSubModulesSettings(moduleName: MODULE_NAMES): string[] {
    const subModuleSetting = `${moduleName.toLowerCase()}.`;
    return this._hideModuleSettings.filter(m => m.includes(subModuleSetting)).map(s => s.split('.')[1]);
  }

  // Hide modules based on tokenizer settings
  // Note: Admin/DM user can view it by enabling the dev settings
  private isModuleVisible(moduleName: MODULE_NAMES): boolean {
    if (ModeStore.isModeEnabled(MODE_TYPES.DEV)) {
      return true;
    }
    return !this._hideModuleSettings.includes(moduleName?.toLocaleLowerCase());
  }
}

const instance = new ModuleStore();

export default instance;
export { ModuleStore as PureModuleStore };

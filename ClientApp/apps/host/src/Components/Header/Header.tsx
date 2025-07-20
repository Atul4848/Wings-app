import { observer } from 'mobx-react';
import React, { FC, useState } from 'react';
import { finalize } from 'rxjs/operators';

import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import { Dropdown, DROPDOWN_TRIGGER } from '@uvgo-shared/dropdown';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { THEMES } from '@wings-shared/core';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { ThemeStore } from '@wings-shared/layout';
import { AuthStore } from '@wings-shared/security';
import ModuleStore from '../../Stores/Module.store';
import { MultiHeader } from '../MultiHeader';
import { useHeaderStyles } from './Header.styles';
import UserSettings from '../UserSettings/UserSettings';
import { DropdownItem } from '@wings-shared/form-controls';

type HeaderAppProps = {};

const envStore: EnvironmentVarsStore = new EnvironmentVarsStore();

const HeaderApp: FC<HeaderAppProps> = () => {
  const classes: Record<string, string> = useHeaderStyles();
  const uvGoLink: string = envStore.getVar(ENVIRONMENT_VARS.UVGO_WEBSITE);
  const hostEnv: string = envStore.getVar(ENVIRONMENT_VARS.HOST_ENVIRONMENT);
  const [ isLightTheme, setIsLightTheme ] = useState<boolean>(ThemeStore.currentTheme === THEMES.LIGHT);
  const { name, isAdminUser, isGeneralUser, isDataManagerUser } = AuthStore.user;

  const toggleThemeHandler = () => {
    ThemeStore.toggleTheme();
    setIsLightTheme(!isLightTheme);
  }

  const logoutHandler = () => {
    AuthStore.logout()
      .pipe(finalize(() => {
        ThemeStore.setDefaultTheme();
        setIsLightTheme(ThemeStore.currentTheme === THEMES.LIGHT);
      }))
      .subscribe();
  }

  const dropdownOptions = (
    <>
      <DropdownItem
        isHeaderItem={true}
        onClick={() => ModalStore.open(<UserSettings />)}
      >
        User Settings
      </DropdownItem>
      <DropdownItem
        isHeaderItem={true}
        isRed
        onClick={logoutHandler}
      >
        Logout
      </DropdownItem>
      <DropdownItem
        isHeaderItem={true}
        isSubtitle
      >
        Themes
      </DropdownItem>
      <DropdownItem
        isHeaderItem={true}
        onClick={toggleThemeHandler}
      >
        {isLightTheme ? THEMES.DARK : THEMES.LIGHT}
      </DropdownItem>
    </>
  );

  const userDropdown = (
    <Dropdown
      popperContent={dropdownOptions}
      trigger={DROPDOWN_TRIGGER.CLICK}
      autoclose={false}
    >
      <div className={classes.profile}>
        <span>{name}</span>
        <ArrowDropDownOutlinedIcon className={classes.dropdown} />
      </div>
    </Dropdown>
  );

  return (
    <MultiHeader
      uvGoLink={uvGoLink}
      links={ModuleStore.menuList}
      rightSide={userDropdown}
      showAdvanceSearch={isAdminUser || isDataManagerUser || isGeneralUser}
      hostEnvironment={hostEnv}
    />
  );
}

export default observer(HeaderApp);

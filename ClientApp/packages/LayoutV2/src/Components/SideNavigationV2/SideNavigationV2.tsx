import {
  Theme,
  ThemeProvider,
  StyledEngineProvider,
  useTheme,
} from '@mui/material';
import { SidebarMenu } from 'sidebar-menu-v2';
import { SearchStore, THEMES } from '@wings-shared/core';
import { useModeStore } from '@wings-shared/mode-store';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { resolvePath, useLocation } from 'react-router-dom';
import { MenuItem } from '../../Interfaces';
import { SidebarRoot } from './SideNavigationV2.styles';
import { SidebarStore } from '../../Stores';
import { useParams } from 'react-router';
import { createTheme } from '@mui/material/styles';
import { LightTheme, DarkTheme } from '../../Components/Themes';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

interface Props {
  sidebarStore?: typeof SidebarStore;
}

export const themes = {
  [THEMES.LIGHT]: LightTheme.LightThemeOptions, // Pass only ThemeOptions
  [THEMES.DARK]: DarkTheme.DarkThemeOptions, // Pass only ThemeOptions
};

const SideNavigationV2 = ({ sidebarStore }: Props) => {
  const appTheme = useTheme();
  const [newTheme, setNewTheme] = useState<Theme>(
    createTheme(themes[THEMES.LIGHT])
  );

  const modeStore = useModeStore();

  const location = useLocation();
  const params = useParams();
  const name = '*';
  const value = params[name];

  useEffect(() => {
    const currentTheme =
      appTheme.palette.mode === 'light'
        ? createTheme(themes[THEMES.LIGHT])
        : createTheme(themes[THEMES.DARK]);

    setNewTheme(currentTheme);
  }, [appTheme]);

  if (!newTheme) return null;

  const currentPath = location.pathname;

  //use to generate the route using navlinks and basePath
  const getPath = (navigateTo: string) =>
    resolvePath(navigateTo, sidebarStore.basePath).pathname;

  const isItemActive = (navigateTo: string) => {
    return (
      currentPath.replace(/^\/+/, '') === getPath(navigateTo) ||
      currentPath === getPath(navigateTo)
    );
  };

  const navItem = item => {
    const pathname = getPath(item.to);
    return {
      ...item,
      to: pathname,
      label: item.title || item.label,
      isActive: isItemActive(item.to),
      clicked: () => {
        if (SearchStore.url === `/${pathname}`) return;
        SearchStore.clearSearch();
      },
    };
  };

  const menuItems = sidebarStore.menuItems
    .filter((item: MenuItem) =>
      item.isHidden ? modeStore.isDevModeEnabled : true
    )
    .map((navigationItem: MenuItem) => {
      if (Boolean(navigationItem?.children?.length)) {
        const isNested = navigationItem.children.some(x =>
          value.includes(x.to)
        );
        return {
          ...navigationItem,
          label: navigationItem.title || navigationItem.label,
          type: navigationItem.type ?? 'section',
          isOpen: isNested
            ? isNested
            : navigationItem.isOpen !== undefined
            ? navigationItem.isOpen
            : true,
          children: navigationItem.children.map(child => navItem(child)),
        };
      }

      return navItem(navigationItem);
    });

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={newTheme}>
        <SidebarRoot>
          <SidebarMenu items={menuItems} />
        </SidebarRoot>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default inject('sidebarStore')(observer(SideNavigationV2));
export { SideNavigationV2 as PureSideNavigationV2 };

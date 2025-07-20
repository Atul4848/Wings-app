import {
  Box,
  Theme,
  ThemeProvider,
  StyledEngineProvider,
  useTheme,
  createTheme,
} from '@mui/material';
import { SidebarMenu, SidebarMenuItem } from '@uvgo-shared/sidebar-menu';
import { SearchStore, THEMES } from '@wings-shared/core';
import { useModeStore } from '@wings-shared/mode-store';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { resolvePath } from 'react-router-dom';
import { INavigationLink } from '../../Interfaces';
import { SidebarRoot, BoxContainer } from './SideNavigation.styles';
import { LightTheme, DarkTheme } from '../../Components/Themes';
import { SidebarStore } from '../../Stores';

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

const SideNavigation = ({ sidebarStore }: Props) => {
  const appTheme = useTheme();
  const [newTheme, setNewTheme] = useState<Theme>(
    createTheme(themes[THEMES.LIGHT])
  );
  const modeStore = useModeStore();

  useEffect(() => {
    const currentTheme =
      appTheme.palette.mode === 'light'
        ? createTheme(themes[THEMES.LIGHT])
        : createTheme(themes[THEMES.DARK]);

    setNewTheme(currentTheme);
  }, [appTheme]);

  if (!newTheme) return null;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={newTheme}>
      <SidebarRoot>
          <SidebarMenu>
          <BoxContainer>
              {sidebarStore.navLinks
                .filter((nav: INavigationLink) =>
                  nav.isHidden ? modeStore.isDevModeEnabled : true
                )
                .map((navigationItem: INavigationLink, index: number) => {
                  /**
                   * If isEnd is not provided, it will be considered as true.
                   * This is due to the fact that most menu items are final.
                   */
                  const isEnd: boolean = navigationItem.hasOwnProperty('isEnd')
                    ? navigationItem.isEnd
                    : true;

                  return (
                    <SidebarMenuItem
                      key={index}
                      iconLikeComponent={navigationItem.icon}
                      label={navigationItem.title}
                      to={
                        resolvePath(
                          navigationItem.to,
                          sidebarStore.basePath
                        ) as any
                      }
                      end={isEnd}
                      disabled={navigationItem.isDisabled}
                      onClick={() => {
                        const pathname = resolvePath(
                          navigationItem.to,
                          sidebarStore.basePath
                        ).pathname;
                        if (SearchStore.url === `/${pathname}`) {
                          return;
                        }
                        SearchStore.clearSearch();
                      }}
                    />
                  );
                })}
             </BoxContainer>
          </SidebarMenu>
        </SidebarRoot>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default inject('sidebarStore')(observer(SideNavigation));
export { SideNavigation as PureSideNavigation };

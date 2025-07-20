import { Box, Theme, ThemeProvider, useTheme } from '@material-ui/core';
import { DarkTheme, LightTheme } from '@uvgo-shared/themes';
import { SidebarMenu, SidebarMenuItem } from '@uvgo-shared/sidebar-menu';
import { SearchStore } from '@wings-shared/core';
import { useModeStore } from '@wings-shared/mode-store';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { resolvePath } from 'react-router-dom';
import { INavigationLink } from '../../Interfaces';
import { useStyles } from './SideNavigation.styles';

interface Props {
  sidebarStore?: any;
}

const SideNavigation = ({ sidebarStore }: Props) => {
  const classes = useStyles();
  const appTheme = useTheme();
  const [ newTheme, setNewTheme ] = useState<Theme>();
  const modeStore = useModeStore();

  useEffect(() => {
    const currentTheme =
      appTheme.palette.type === 'light' ? LightTheme : DarkTheme;
    setNewTheme(currentTheme);
  }, [ appTheme ]);

  if (!newTheme) return null;

  return (
    <ThemeProvider theme={newTheme}>
      <div className={classes.sidebarRoot}>
        <SidebarMenu>
          <Box className={classes.boxContainer}>
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
          </Box>
        </SidebarMenu>
      </div>
    </ThemeProvider>
  );
};

export default inject('sidebarStore')(observer(SideNavigation));
export { SideNavigation as PureSideNavigation };

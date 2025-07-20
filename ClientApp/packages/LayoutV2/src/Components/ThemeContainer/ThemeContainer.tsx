import React, { useEffect, useState } from 'react';
import { Provider } from 'mobx-react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  CssBaseline,
  Theme,
  StyledEngineProvider,
  ThemeProvider as ThemeProviderV5,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { THEMES, EVENT, EventEmitter } from '@wings-shared/core';
import { Authorization } from '@wings-shared/security';
import ThemeStore from '../../Stores/Theme.store';
import SidebarStore from '../../Stores/Sidebar.store';
import GlobalStyles from '../GlobalStyles/GlobalStyles';
import { LightTheme, DarkTheme } from '../../Components/Themes';
import { ThemeProvider as ThemeProviderV4 } from '@material-ui/core';
declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export const themes = {
  [THEMES.LIGHT]: LightTheme.LightThemeOptions,
  [THEMES.DARK]: DarkTheme.DarkThemeOptions,
};

const ThemeContainer = ({ children, appName = 'jas', store = {} }) => {
  const [currentTheme, setMuiTheme] = useState(
    createTheme(themes[ThemeStore.currentTheme as keyof typeof themes])
  );

  const changeTheme = (event: Event) => {
    const themeName = (event as CustomEvent<string>).detail;
    setMuiTheme(createTheme(themes[themeName]));
  };

  useEffect(() => {
    EventEmitter.on(EVENT.CHANGE_THEME, changeTheme);
    return () => {
      EventEmitter.off(EVENT.CHANGE_THEME, changeTheme);
    };
  }, []);

  const router = createBrowserRouter([
    {
      path: '/*',
      Component() {
        return <Authorization>{children}</Authorization>;
      },
    },
  ]);

  return (
    <Provider {...store} themeStore={ThemeStore} sidebarStore={SidebarStore}>
      <StyledEngineProvider injectFirst>
        <ThemeProviderV5 theme={currentTheme}>
          <ThemeProviderV4 theme={currentTheme}>
            <CssBaseline />
            <GlobalStyles />
            <RouterProvider router={router} />
          </ThemeProviderV4>
        </ThemeProviderV5>
      </StyledEngineProvider>
    </Provider>
  );
};

export default ThemeContainer;

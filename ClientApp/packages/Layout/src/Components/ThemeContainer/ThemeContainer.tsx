import React, { useEffect, useState } from 'react';
import { Provider } from 'mobx-react';
import { DarkTheme, LightTheme } from '@uvgo-shared/themes';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { THEMES, EVENT, EventEmitter } from '@wings-shared/core';
import { Authorization } from '@wings-shared/security';
import ThemeStore from '../../Stores/Theme.store';
import SidebarStore from '../../Stores/Sidebar.store';
import GlobalStyles from '../../Components/GlobalStyles/GlobalStyles';

const themes = {
  [THEMES.LIGHT]: LightTheme,
  [THEMES.DARK]: DarkTheme,
};

const ThemeContainer = ({ children, appName = 'jas', store = {} }) => {
  const [currentTheme, setMuiTheme] = useState(
    createTheme(themes[ThemeStore.currentTheme])
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

  const generateClassName = createGenerateClassName({
    disableGlobal: false,
    productionPrefix: appName, // defaults to 'jss'
    //seed: 'wings-mfe', // defaults to ''
  });

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
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          <GlobalStyles />
          <RouterProvider router={router} />
        </ThemeProvider>
      </StylesProvider>
    </Provider>
  );
};

export default ThemeContainer;

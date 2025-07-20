import { ThemeContainer } from '@wings-shared/layout';
import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ModalKeeper } from '@uvgo-shared/modal-keeper';
import MountApp, { IMountApp } from './Apps/MountApp';
import HeaderApp from './Components/Header/Header';
import { AuthStore } from '@wings-shared/security';
import AdvanceSearchApp from './Apps/AdvanceSearch';

const apps: IMountApp[] = [
  { path: 'airports', name: '@wings/airports' },
  { path: 'geographic', name: '@wings/time-zone' },
  { path: 'permits', name: '@wings/permits' },
  { path: 'airport-logistics', name: '@wings/airport-logistics' },
  { path: 'countries', name: '@wings/countries' },
  { path: 'user-management', name: '@wings/user-management' },
  { path: 'restrictions', name: '@wings/restrictions' },
  { path: 'aircraft', name: '@wings/aircraft' },
  { path: 'notifications', name: '@wings/notifications' },
  { path: 'general', name: '@wings/general' },
  { path: 'vendor-management', name: '@wings/vendor-management' },
  { path: 'customer', name: '@wings/customer' },
];

const App = () => {
  const handleClearStorage = async event => {
    if (event.key === null) {
      try {
        await AuthStore.logout();
        window.location.reload();
      } catch (e) {
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    AuthStore.configureStore();
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleClearStorage);
    return () => {
      window.removeEventListener('storage', handleClearStorage);
    };
  }, []);

  return (
    <ThemeContainer>
      <HeaderApp />
      <ModalKeeper />
      <Routes>
        {apps
          .filter(x => !x.hideApp)
          .map((app, idx) => (
            <Route key={idx} path={`/${app.path}/*`} element={<MountApp app={app} key={app.name} />} />
          ))}
        <Route path="*" element={<Navigate to="/airports" />} />
        <Route path="advance-search" element={<AdvanceSearchApp />} />
      </Routes>
    </ThemeContainer>
  );
};

export default App;

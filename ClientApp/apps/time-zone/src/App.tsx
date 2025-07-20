import React, { useState, useEffect } from 'react';
import Timezone from './index';
import { AuthStore, SettingsModuleSecurity } from '@wings-shared/security';
import { TimeZoneModuleSecurity } from './Modules/Shared/Tools';

const App = () => {
  const [ isPermissionsLoaded, setIsPermissionsLoaded ] = useState(false);

  useEffect(() => {
    //SettingsModuleSecurity.updatePermissions();
    //TimeZoneModuleSecurity.init();
    AuthStore.configureAgGrid();
    setIsPermissionsLoaded(true);
  }, []);

  return isPermissionsLoaded ? <Timezone basePath="geographic" /> : <></>;
};

export default App;

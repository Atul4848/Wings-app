import React, { useState, useEffect } from 'react';
import Aircraft from './index';
import { AuthStore } from '@wings-shared/security';

const App = () => {
  const [ isPermissionsLoaded, setIsPermissionsLoaded ] = useState(false);

  useEffect(() => {
    AuthStore.configureAgGrid();
    setIsPermissionsLoaded(true);
  }, []);

  return isPermissionsLoaded ? <Aircraft basePath="aircraft" /> : <></>;
};

export default App;

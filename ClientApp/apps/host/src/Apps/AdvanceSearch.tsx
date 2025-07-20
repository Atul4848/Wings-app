import React from 'react';
import { GqlContainer } from '@wings-shared/gql-query-builder';
import { useTheme } from '@material-ui/core';

const AdvanceSearchApp = () => {
  const theme = useTheme();
  return <GqlContainer theme={theme} />;
};
export default AdvanceSearchApp;

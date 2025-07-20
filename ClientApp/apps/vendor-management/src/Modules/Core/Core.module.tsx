import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import VendorLevelGrid from '../VendorLevelGrid/VendorLevelGrid';
import { SidebarStore } from '@wings-shared/layout';
import { sidebarMenus } from '../Shared/Components/SidebarMenu/SidebarMenu';

const useStyles = makeStyles((theme) => ({
  vmsVendorsContainer:{
    backgroundColor:''
  }
}));

const CoreModule = () => {
  const classes = useStyles();

  useEffect(() => {
    SidebarStore.setNavLinks(sidebarMenus, 'vendor-management');
  }, []);

  return (
    <div className={classes.vmsVendorsContainer}>
      <VendorLevelGrid />
    </div>
  );
};

export default CoreModule;

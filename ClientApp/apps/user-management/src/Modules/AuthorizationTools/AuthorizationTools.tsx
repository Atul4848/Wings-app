import React, { FC, useEffect, useState } from 'react';
import { Theme } from '@material-ui/core';
import { TabsLayout } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { inject, observer } from 'mobx-react';
import { styles } from './AuthorizationTools.styles';
import FactExplorer from './Components/FactExplorer/FactExplorer';
import { IClasses } from '@wings-shared/core';
import AuthTester from './Components/AuthTester/AuthTester';
import { UserStore } from '../Shared';

interface Props {
  classes?: IClasses;
  theme?: Theme;
  userStore?: UserStore;
  isGridDataLoaded?: boolean;
}

const AuthorizationTools : FC<Props> = ({ userStore }: Props) => {
  const  tabs: string[] = [ 'Fact Explorer', 'Auth Tester' ];
  const [ activeTab, setActiveTab ] =  useState<string>('');
  const classes: Record<string, string> = styles();

  useEffect(() => {
    setActiveTab(tabs[0]);
  }, []);

  return (
    <>
      <div className={classes.userTab}>
        <TabsLayout
          tabs={tabs}
          headingTitle=""
          activeTab={activeTab}
          onTabChange={(nextTab: string) => (setActiveTab(nextTab))}
        >
          <TabPanel className={classes.tabPanel} value={tabs[0]}>
            <FactExplorer />
          </TabPanel>
          <TabPanel className={classes.tabPanel} value={tabs[1]}>
            <AuthTester />
          </TabPanel>
        </TabsLayout>
      </div>
    </>
  );
};

export default inject('userStore')(observer(AuthorizationTools));

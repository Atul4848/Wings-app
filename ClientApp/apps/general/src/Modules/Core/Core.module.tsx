import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Theme, withStyles } from '@material-ui/core';
import { TabsLayout, getTabsStyles } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { observable } from 'mobx';
import { Reset, Settings, Report } from './Components';
import { inject, observer } from 'mobx-react';
import { CacheControlStore } from '../Shared';
import { IClasses, UnsubscribableComponent } from '@wings-shared/core';

interface Props  {
  classes?: IClasses;
  theme?: Theme;
  cacheControlStore?: CacheControlStore
}


const CoreModule : FC<Props> = ({ ...props }: Props) => {
  const tabs: string[] = [ 'Clear', 'Settings', 'Report' ];
  const [ activeTab, setActiveTab ] = useState<string>('');
  const classes = props.classes as IClasses;
  
  useEffect(() => {
    setActiveTab(tabs[0])
  }, []);

  return (
    <TabsLayout
      tabs={tabs}
      headingTitle=''
      activeTab={activeTab}
      onTabChange={(nextTab: string) => (setActiveTab(nextTab))}
    >
      <TabPanel className={classes.tabPanel} value={tabs[0]}>
        <Reset cacheControlStore={props.cacheControlStore} />
      </TabPanel>
      <TabPanel className={classes.tabPanel} value={tabs[1]}>
        <Settings />
      </TabPanel>
      <TabPanel className={classes.tabPanel} value={tabs[2]}>
        <Report />
      </TabPanel>
    </TabsLayout>
  );
};

export default inject('cacheControlStore')(withStyles(getTabsStyles)(observer(CoreModule)));

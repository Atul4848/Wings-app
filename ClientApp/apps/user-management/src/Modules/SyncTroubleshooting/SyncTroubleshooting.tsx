import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Theme, withStyles } from '@material-ui/core';
import { TabsLayout, getTabsStyles } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { observable } from 'mobx';
import Jobs from './Components/Jobs/Jobs';
import Cache from './Components/Cache/Cache';
import Synchronisation from './Components/Synchronisation/Synchronisation';
import { inject, observer } from 'mobx-react';
import { SyncTroubleshootStore } from '../Shared';
import { IClasses, UnsubscribableComponent } from '@wings-shared/core';
import Facts from './Components/Facts/Facts';
import { useStyles } from './SyncTroubleshooting.styles';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  syncTroubleshootStore?: SyncTroubleshootStore
};

const SyncTroubleshootingCore: FC<Props> = ({ ...props }: Props) => {
  const tabs: string[] = [
    'Cache',
    'Jobs',
    'Synchronisation',
    'Facts',
  ];

  const [ activeTab, setActiveTab ] = useState<string>('');
  const classes = useStyles();
  useEffect(() => {
    setActiveTab(tabs[0])
  }, []);

  return (
    <div className={classes.userTab}>
      <TabsLayout
        tabs={tabs}
        headingTitle=''
        activeTab={activeTab}
        onTabChange={(nextTab: string) => (setActiveTab(nextTab))}
      >
        <TabPanel className={classes.tabPanel} value={tabs[0]}>
          <Cache syncTroubleshootStore={props.syncTroubleshootStore} />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value={tabs[1]}>
          <Jobs syncTroubleshootStore={props.syncTroubleshootStore} />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value={tabs[2]}>
          <Synchronisation syncTroubleshootStore={props.syncTroubleshootStore} />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value={tabs[3]}>
          <Facts syncTroubleshootStore={props.syncTroubleshootStore} />
        </TabPanel>
      </TabsLayout>
    </div>
  );
};

export default inject('syncTroubleshootStore')(withStyles(getTabsStyles)(observer(SyncTroubleshootingCore)));

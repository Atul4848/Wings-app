import React, { FC, useEffect, useState } from 'react';
import { getTabsStyles, TabsLayout } from '@wings-shared/layout';
import { withStyles, Theme } from '@material-ui/core';
import { observer } from 'mobx-react';
// eslint-disable-next-line max-len
import TabPanel from '@material-ui/lab/TabPanel';
import { Settings } from '../SyncSettings/Components';
import { SETTING_TYPE } from '../Shared';
import { IClasses } from '@wings-shared/core';
import { styles } from './SyncSettings.styles';
type Props = {
  classes?: IClasses;
};

const SyncSettings: FC<Props> = ({ ...props }: Props) => {
  const tabs: string[] = [ 'Settings', 'Recurring Jobs' ];
  const [ activeTab, setActiveTab ] = useState<string>('');
  const classes: Record<string, string> = styles();
  useEffect(() => {
    setActiveTab(tabs[0])
  }, []);


  return (
    <div className={classes.mainContent}>
      <TabsLayout
        tabs={tabs}
        headingTitle=""
        activeTab={activeTab}
        onTabChange={(nextTab: string) => (setActiveTab(nextTab))}
      >
        <TabPanel key={tabs[0]} className={classes.tabPanel} value={tabs[0]}>
          <Settings settingType={SETTING_TYPE.SETTING} />
        </TabPanel>
        <TabPanel key={tabs[1]} className={classes.tabPanel} value={tabs[1]}>
          <Settings settingType={SETTING_TYPE.RECURRING} />
        </TabPanel>
      </TabsLayout>
    </div>
  );
}

export default (observer(SyncSettings));
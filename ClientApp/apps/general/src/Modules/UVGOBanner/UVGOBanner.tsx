import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Theme, withStyles } from '@material-ui/core';
import { TabsLayout, getTabsStyles } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { observable } from 'mobx';
import UVGOBanner from './Components/UVGOBanner/UVGOBanner';
import BannerType from './Components/BannerType/BannerType';
import BannerServices from './Components/BannerServices/BannerServices';
import { inject, observer } from 'mobx-react';
import { UVGOBannerStore } from '../Shared';
import { IClasses, UnsubscribableComponent } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  uvgoBannerStore?: UVGOBannerStore;
}

const UVGOBannerCore: FC<Props> = ({ ...props }: Props) => {
  const tabs: string[] = [
    'Banners',
    'Banner Type',
    'Banner Services',
  ];
  const [ activeTab, setActiveTab ] = useState<string>('');
  const classes = props.classes;

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
        <UVGOBanner uvgoBannerStore={props.uvgoBannerStore} />
      </TabPanel>
      <TabPanel className={classes.tabPanel} value={tabs[1]}>
        <BannerType />
      </TabPanel>
      <TabPanel className={classes.tabPanel} value={tabs[2]}>
        <BannerServices />
      </TabPanel>
    </TabsLayout>
  );
}

export default inject('uvgoBannerStore')(withStyles(getTabsStyles)(observer(UVGOBannerCore)));

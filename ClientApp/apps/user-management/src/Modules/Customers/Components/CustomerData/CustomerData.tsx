import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
import { TabsLayout } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { observer } from 'mobx-react';
import { CustomersStore, SiteModel } from '../../../Shared';
import { useStyles } from './CustomerData.styles';
import { IClasses } from '@wings-shared/core';
import SitesGrid from '../SitesGrid/SitesGrid';
import Users from '../Users/Users';

interface Props {
  classes?: IClasses;
  theme?: Theme;
  customerStore?: CustomersStore;
  sitesField: SiteModel[];
  upsertSiteField: (siteField: SiteModel) => void;
  deleteSiteField: (siteField) => void;
}

const CustomersSubTab: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const tabs: string[] = [ 'Sites', 'Users' ];
  const [ activeTab, setActiveTab ] = useState(tabs[0]);

  return (
    <>
      <div className={classes.userTab}>
        <TabsLayout
          tabs={tabs}
          headingTitle=""
          activeTab={activeTab}
          onTabChange={(nextTab: string) => setActiveTab(nextTab)}
        >
          <TabPanel value={tabs[0]}>
            <SitesGrid
              sitesField={props.sitesField}
              upsertSiteField={siteField => props.upsertSiteField(siteField)}
              deleteSiteField={(siteField) => props.deleteSiteField(siteField)}
            />
          </TabPanel>
          <TabPanel value={tabs[1]}>
            <Users />
          </TabPanel>
        </TabsLayout>
      </div>
    </>
  );
}

export default (observer(CustomersSubTab));

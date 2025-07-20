import React, { FC, useEffect, useState } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { TabsLayout } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { inject, observer } from 'mobx-react';
import { UserStore } from '../../../Shared';
import { useStyles } from './UVGOSubTab.styles';
import { IClasses } from '@wings-shared/core';
import { UserServiceNProduct } from '../../../OktaUsers/Components';
import { useParams } from 'react-router';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  userStore?: UserStore;
  id: string;
};

const UVGOSubTab: FC<Props> = ({ ...props }: Props) => {
  const [ tabs, setTabs ] = useState<string[]>([ 'Product & Services' ]);
  const [ activeTab, setActiveTab ] = useState(tabs[0]);
  const params = useParams();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, null);

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
  }, []);

  return (
    <>
      <div>
        <TabsLayout
          tabs={tabs}
          headingTitle=""
          activeTab={activeTab}
          onTabChange={(nextTab: string) => setActiveTab(nextTab)}
        >
          <TabPanel className={classes.tabPanel} value={tabs[0]}>
            <div className={classes.flexRowGrid}>
              {props.userStore.userDetails?.servicesNProducts.length === 0 && (
                <Typography variant="h6" className={classes.title}>
                  No Products and Services
                </Typography>
              )}
              {props.userStore.userDetails?.servicesNProducts.length > 0 && (
                <UserServiceNProduct servicesNProducts={props.userStore.userDetails?.servicesNProducts} />
              )}
            </div>
          </TabPanel>
        </TabsLayout>
      </div>
    </>
  );
}

export default inject('userStore')(observer(UVGOSubTab));

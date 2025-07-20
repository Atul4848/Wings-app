import React, { FC, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { Theme } from '@material-ui/core';
import TabPanel from '@material-ui/lab/TabPanel';
import { inject, observer } from 'mobx-react';
import { CSDUserModel, UserStore } from '../../../Shared';
import UpsertUser from '../UpsertUser/UpsertUser';
import { useStyles } from './UserTab.styles';
import { ArrowBack } from '@material-ui/icons';
import UVGOTab from '../uvGOTab/uvGOTab';
import { IClasses, UIStore } from '@wings-shared/core';
import { CustomLinkButton, TabsLayout } from '@wings-shared/layout';
import { useParams } from 'react-router';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  userStore?: UserStore;
  isGridDataLoaded?: boolean;
};

const UsersTab: FC<Props> = ({ ...props }: Props) => {
  const [ tabs, setTabs ] = useState<string[]>([ 'User' ]);
  const [ activeTab, setActiveTab ] = useState(tabs[0]);
  const params = useParams();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent<CSDUserModel>(params, null);

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    if (params.mode?.toUpperCase() === VIEW_MODE.EDIT) {
      setTabs([ tabs[0], 'uvGO' ]);
    }
  }, []);

  return (
    <>
      <div className={classes.customLinkBtn}>
        <CustomLinkButton
          to="/user-management"
          title="Back To List"
          startIcon={<ArrowBack />}
          onClick={() => props.userStore?.setUserDetail(new CSDUserModel())}
        />
      </div>
      <div className={classes.userTab}>
        <TabsLayout
          tabs={tabs}
          headingTitle=""
          activeTab={activeTab}
          onTabChange={(nextTab: string) => setActiveTab(nextTab)}
          isDisable={() =>  UIStore.pageLoading}
        >
          <TabPanel className={classes.tabPanel} value={tabs[0]}>
            <UpsertUser />
          </TabPanel>
          <TabPanel className={classes.tabPanel} value={tabs[1]}>
            <UVGOTab />
          </TabPanel>
        </TabsLayout>
      </div>
    </>
  );
};

export default inject('userStore')(observer(UsersTab));

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Theme, Typography, withStyles } from '@material-ui/core';
import { TabsLayout } from '@wings-shared/layout';
import TabPanel from '@material-ui/lab/TabPanel';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { UserStore, UserFactsModel, UserProfileRolesModel } from '../../../Shared';
import { useStyles } from './UsersSubTab.styles';
import UserProfileRolesGrid from '../UserProfileRolesGrid/UserProfileRolesGrid';
import OktaGroupsGrid from '../OktaUser/OktaGroupsGrid';
import { IClasses, ViewPermission, UnsubscribableComponent } from '@wings-shared/core';
import UserFactsGrid from '../UserFactsGrid/UserFactsGrid';
import Logs from '../../../Logs/Logs';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  userStore?: UserStore;
  isGridDataLoaded?: boolean;
  facts: UserFactsModel[];
  userId: string;
  id: string;
  rolesField: UserProfileRolesModel[];
  openRoleFieldDialog: (rolesField: UserProfileRolesModel, viewMode: VIEW_MODE) => void;
  upsertRoleField: (rolesField: UserProfileRolesModel) => void;
  deleteRoleField: (role: UserProfileRolesModel) => void;
};

const UsersSubTab: FC<Props> = ({ ...props }: Props) => {
  const [ tabs, setTabs ] = useState<string[]>([ 'Roles', 'User Facts', 'Okta Groups', 'User Logs' ]);
  const [ activeTab, setActiveTab ] = useState(tabs[0]);
  const params = useParams();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, null);

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
  }, []);

  return (
    <>
      <div className={classes.userSubTab}>
        <TabsLayout
          tabs={tabs}
          headingTitle=""
          activeTab={activeTab}
          onTabChange={(nextTab: string) => setActiveTab(nextTab)}
        >
          <TabPanel className={classes.tabPanel} value={tabs[0]}>
            <div className={classes.flexRowGrid}>
              <div className={classes.firstGrid}>
                <UserProfileRolesGrid
                  rolesField={props.rolesField}
                  openRoleFieldDialog={(roleField, viewMode) => props.openRoleFieldDialog(roleField, viewMode)}
                  upsertRoleField={roleField => props.upsertRoleField(roleField)}
                  deleteRoleField={(role: UserProfileRolesModel) => props.deleteRoleField(role)}
                  userId={props.id}
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel className={classes.tabPanel} value={tabs[1]}>
            <div className={classes.flexRowGrid}>
              <div className={classes.firstGrid}>
                {!props.isGridDataLoaded && (
                  <Typography variant="h6" className={classes.title}>
                    No User Facts to Show
                  </Typography>
                )}
              </div>
            </div>
            <ViewPermission hasPermission={props.isGridDataLoaded}>
              <UserFactsGrid facts={props.facts} id={props.id} />
            </ViewPermission>
          </TabPanel>
          <TabPanel className={classes.tabPanel} value={tabs[2]}>
            {props.userStore?.loadUserGroups.length === 0 && (
              <Typography variant="h6" className={classes.title}>
                No OKTA User to Show
              </Typography>
            )}
            <ViewPermission hasPermission={props.userStore?.loadUserGroups.length === 1}>
              <OktaGroupsGrid userId={props.userId} />
            </ViewPermission>
          </TabPanel>
          <TabPanel className={classes.tabPanel} value={tabs[3]}>
            <div className={classes.userLogTab}>
              <div className={classes.userLogGrid}>
                <Logs id={props.id} />
              </div>
            </div>
          </TabPanel>
        </TabsLayout>
      </div>
    </>
  );
}

export default inject('userStore')(observer(UsersSubTab));

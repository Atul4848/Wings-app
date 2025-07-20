import { IBaseModuleProps } from '@wings/shared';
import { observable, reaction, toJS } from 'mobx';
import { disposeOnUnmount, inject, observer } from 'mobx-react';
import React, { Component, FC, ReactNode, useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PeopleIcon from '@material-ui/icons/People';
import { Applications, OktaUsers, Customers, Services, UserManagementModuleSecurity, Users } from './Modules';
import UserMigration from './Modules/UserMigration/UserMigration';
import Groups from './Modules/Groups/Groups';
import FederationMapping from './Modules/FederationMapping/FederationMapping';
import ManageGroupUsers from './Modules/Groups/Components/ManageGroupUsers/ManageGroupUsers';
import PersonIcon from '@material-ui/icons/Person';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import VisibilityIcon from '@material-ui/icons/Visibility';
import UserProfile from './Modules/OktaUsers/Components/UserProfile/UserProfile';
import SessionViolations from './Modules/SessionViolations/SessionViolations';
import SyncTroubleshooting from './Modules/SyncTroubleshooting/SyncTroubleshooting';
import SecurityIcon from '@material-ui/icons/Security';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import UpdateIcon from '@material-ui/icons/Update';
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import GroupAdd from '@material-ui/icons/GroupAdd';
import Logs from './Modules/Logs/Logs';
import UsersTab from './Modules/Users/Components/UsersTab/UsersTab';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { ServiceIcon, CustomerIcon, ConstructIcon, HomeIcon, LayersIcon } from '@uvgo-shared/icons';
import {
  AuthStore,
  SettingsModuleSecurity,
  USER_GROUP,
  ProtectedArea,
  useRoles,
} from '@wings-shared/security';
import { INavigationLink, ProtectedRoute } from '@wings-shared/layout';
import AuthorizationTools from './Modules/AuthorizationTools/AuthorizationTools';
import UpsertApplications from './Modules/Applications/Components/UpsertApplications/UpsertApplications';
import UpsertServices from './Modules/Services/Components/UpsertServices/UpsertServices';
import UpsertCustomer from './Modules/Customers/Components/UpsertCustomer/UpsertCustomer';

const sideMenuActiveUser: INavigationLink[] = [
  {
    to: '',
    title: 'Active uvGO Users',
    icon: <VisibilityIcon />,
  },
];

const UserManagementApp = (props: IBaseModuleProps) => {
  const env = new EnvironmentVarsStore();
  const hostEnvironment = env.getVar(ENVIRONMENT_VARS.HOST_ENVIRONMENT);
  const redirectPath: string = '/user-management';

  const um_permissions: string[] = [ 'um_reader', 'um_manager', 'um_admin' ];

  const { hasAnyRole, hasAllRoles } = useRoles(um_permissions);

  const sidebarMenus: INavigationLink[] = [
    {
      to: 'users',
      isHidden: !AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN),
      title: 'Users',
      icon: <GroupAdd />,
      isEnd: false,
    },
    {
      to: 'okta-users',
      title: 'Okta Users',
      isHidden: !hasAnyRole,
      icon: <PersonIcon />,
      isEnd: false,
    },
    {
      to: 'user-migration',
      title: 'CSD User Migration',
      isHidden: !hasAnyRole,
      icon: <PersonAddIcon />,
      isEnd: false,
    },
    {
      to: 'customers',
      isHidden: !hasAnyRole,
      title: 'Customers',
      icon: <CustomerIcon />,
      isEnd: false,
    },
    {
      to: 'app-services',
      isHidden: !hasAnyRole,
      title: 'App Services',
      icon: <ServiceIcon />,
      isEnd: false,
    },
    {
      to: 'applications',
      isHidden: !hasAnyRole,
      title: 'Applications',
      icon: <HomeIcon />,
      isEnd: false,
    },
    {
      to: 'groups',
      isHidden: !hasAnyRole,
      title: 'Groups',
      icon: <LayersIcon />,
      isEnd: false,
    },
    {
      to: 'federation-mapping',
      title: 'Federation Mapping',
      isHidden: !hasAnyRole,
      icon: <SupervisedUserCircleIcon />,
      isEnd: false,
    },
    {
      to: 'session-violations',
      title: 'Session Violations',
      isHidden: !hasAnyRole,
      icon: <UpdateIcon />,
      isEnd: false,
    },
    {
      to: 'sync-troubleshooting',
      isHidden: !useRoles([ 'um_admin', 'um_manager' ]).hasAnyRole,
      title: 'Sync Troubleshooting',
      icon: <SyncProblemIcon />,
      isEnd: false,
    },
    {
      to: 'logs',
      isHidden: !hasAnyRole,
      title: 'Logs',
      icon: <SyncAltIcon />,
      isEnd: false,
    },
    {
      to: 'authorization-tools',
      title: 'Authorization Tools',
      isHidden: !hasAnyRole,
      icon: <ConstructIcon />,
      isEnd: false,
    },
  ];

  useEffect(() => {
    reaction(
      () => AuthStore.permissions.emitChanges,
      () => {
        if (localStorage.debugger) {
          console.log('%cSet sidebar items:', 'color: mediumOrchid; font-size: 13px;');
          console.log(toJS(sidebarMenus));
        }
        props.sidebarStore.setNavLinks(sidebarMenus, props.basePath);
      },
      { fireImmediately: true }
    );
    UserManagementModuleSecurity.init();
    SettingsModuleSecurity.updatePermissions();
  }, [ hasAnyRole, hasAllRoles ]);

  return (
    <Routes>
      <Route path="user-management/*">
        <Route index element={<Navigate to="users" />} />
        <Route
          path="users"
          element={
            <ProtectedRoute
              element={<Users />}
              hasPermission={AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN)}
              redirectPath={
                AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN) ? redirectPath : '/user-management/okta-users'
              }
            />
          }
        />
        <Route
          path="users/:mode"
          element={
            <ProtectedRoute
              element={<UsersTab key={'user-view'} />}
              hasPermission={AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN)}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="users/:id/:mode"
          element={
            <ProtectedRoute
              element={<UsersTab key={'user-edit'} />}
              hasPermission={AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN)}
              redirectPath={redirectPath}
            />
          }
        />
        <Route path="okta-users" element={<OktaUsers />} />
        <Route path="okta-users/:id/:mode" element={<UserProfile key="userProfile" />} />
        <Route path="user-migration" element={<UserMigration />} />
        <Route path="user-profile/:id/:mode" element={<UserProfile key="userProfile" />} />
        <Route
          path="customers"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <Customers />
            </ProtectedArea>
          }
        />
        <Route
          path="customers/:mode"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <UpsertCustomer key={'customer-view'} />
            </ProtectedArea>
          }
        />
        <Route
          path="customers/:id/:mode"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <UpsertCustomer key={'customer-edit'} />
            </ProtectedArea>
          }
        />
        <Route
          path="app-services"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <Services />
            </ProtectedArea>
          }
        />
        <Route
          path="app-services/:mode"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <UpsertServices key={'services-view'} />
            </ProtectedArea>
          }
        />
        <Route
          path="app-services/:id/:mode"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <UpsertServices key={'services-edit'} />
            </ProtectedArea>
          }
        />
        <Route
          path="applications"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <Applications />
            </ProtectedArea>
          }
        />
        <Route
          path="applications/:mode"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <UpsertApplications key={'applications-view'} />
            </ProtectedArea>
          }
        />
        <Route
          path="applications/:id/:mode"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <UpsertApplications key={'applications-edit'} />
            </ProtectedArea>
          }
        />
        <Route
          path="groups"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <Groups />
            </ProtectedArea>
          }
        />
        <Route
          path="groups/:id/:name"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <ManageGroupUsers />
            </ProtectedArea>
          }
        />
        <Route
          path="federation-mapping"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <FederationMapping />
            </ProtectedArea>
          }
        />
        <Route
          path="session-violations"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <SessionViolations />
            </ProtectedArea>
          }
        />
        <Route
          path="sync-troubleshooting"
          element={
            <ProtectedRoute
              element={<SyncTroubleshooting />}
              hasPermission={AuthStore.permissions.hasAnyRole([ 'um_admin', 'um_manager' ])}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="logs"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <Logs />
            </ProtectedArea>
          }
        />
        <Route
          path="authorization-tools"
          element={
            <ProtectedArea roles={um_permissions} redirect={redirectPath}>
              <AuthorizationTools />
            </ProtectedArea>
          }
        />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(UserManagementApp));

import { IBaseModuleProps } from '@wings/shared';
import { AuthStore, SettingsModuleSecurity, USER_GROUP } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import React, { Component, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import CachedOutlinedIcon from '@material-ui/icons/CachedOutlined';
import MobileFriendlyOutlinedIcon from '@material-ui/icons/MobileFriendlyOutlined';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { CoreModule } from './Modules';
import MobileRelease from './Modules/MobileRelease/MobileRelease';
import { MobileReleaseModuleSecurity } from './Modules/Shared';
import VisibilityIcon from '@material-ui/icons/Visibility';
import UVGOBanner from './Modules/UVGOBanner/UVGOBanner';
import ScottIPC from './Modules/ScottIPC/ScottIPC';
import SyncTroubleshoot from './Modules/SyncTroubleshoot/SyncTroubleshoot';
import FeatureNote from './Modules/FeatureNotes/FeatureNote';
import NotesIcon from '@material-ui/icons/Notes';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import { FeatureNoteEditor } from './Modules/FeatureNotes/Components';
import SyncHistory from './Modules/SyncHistory/SyncHistory';
import HistoryIcon from '@material-ui/icons/History';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import SettingsIcon from '@material-ui/icons/Settings';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import SyncSettings from './Modules/SyncSettings/SyncSettings';
import RetailData from './Modules/RetailData/RetailData';
import UVGOSettings from './Modules/UVGOSettings/UVGOSettings';
import UvgoSettingEditor from './Modules/UVGOSettings/Components/UpsertUvgoSetting/UvgoSettingEditor';
import { DatabaseIcon } from '@uvgo-shared/icons';
import { observable } from 'mobx';
import { INavigationLink, ProtectedRoute } from '@wings-shared/layout';
import { NotFoundPage, ViewPermission } from '@wings-shared/core';
import { GqlContainer } from '@wings-shared/gql-query-builder';
import { useTheme } from '@material-ui/core';
import ActiveUsers from './Modules/ActiveUsers/ActiveUsers';
import { UserManagementModuleSecurity } from '@wings/user-management/src/Modules';
import Fuel from './Modules/Fuel/Fuel';
import NoPermissionPage from './Modules/NoPermissionPage/NoPermissionPage';

const AdvanceSearch = () => {
  const theme = useTheme();
  return <GqlContainer theme={theme as any} />;
};

@inject('sidebarStore')
@observer
class GeneralApp extends Component<IBaseModuleProps> {
  private readonly redirectPath: string = '/general';
  @observable private sidebarMenus: INavigationLink[] = [
    {
      to: '',
      title: 'Cache Control',
      isHidden: !this.hasGeneralReadRole(),
      icon: <CachedOutlinedIcon />,
    },
    {
      to: 'mobile-releases',
      isHidden: !this.hasGeneralReadRole(),
      title: 'Mobile Releases',
      icon: <MobileFriendlyOutlinedIcon />,
    },
    {
      to: 'fuel',
      title: 'Fuel',
      isHidden: !this.hasGeneralReadRole(),
      icon: <LocalGasStationIcon />,
    },
    {
      to: 'system-messages',
      title: 'uvGO Banner',
      isHidden: !this.hasGeneralReadRole(),
      icon: <SpeakerNotesIcon />,
    },
    {
      to: 'scott-ipc',
      title: 'Scott IPC',
      isHidden: !this.hasGeneralReadRole(),
      icon: <PeopleAltIcon />,
    },
    {
      to: 'feature-notes',
      title: 'Feature Notes',
      isHidden: !this.hasGeneralReadRole(),
      icon: <NotesIcon />,
    },
    {
      to: 'sync-History',
      title: 'Sync History',
      isHidden: !this.hasGeneralReadRole(),
      icon: <HistoryIcon />,
    },
    {
      to: 'active-uvgo-users',
      title: 'Active uvGO Users',
      isHidden: !this.hasGeneralReadRole(),
      icon: <VisibilityIcon />,
    },
    {
      to: 'sync-troubleshoot',
      title: 'Sync Troubleshooting',
      isHidden: !this.hasGeneralReadRole(),
      icon: <SyncProblemIcon />,
    },
    {
      to: 'sync-settings',
      title: 'Sync Settings',
      isHidden: !this.hasGeneralReadRole(),
      icon: <SettingsIcon />,
    },
    {
      to: 'retail-Data',
      title: 'Retail Data',
      isHidden: !this.hasGeneralReadRole(),
      icon: <DatabaseIcon size="large" />,
    },
    {
      to: 'uvgo-settings',
      title: 'uvGO Settings',
      isHidden: !this.hasGeneralReadRole(),
      icon: <SettingsApplicationsIcon />,
    },
  ];

  constructor(props) {
    super(props);
    MobileReleaseModuleSecurity.init();
    UserManagementModuleSecurity.init();
    SettingsModuleSecurity.updatePermissions();
    AuthStore.configureAgGrid();
  }

  componentDidMount(): void {
    this.props.sidebarStore.setNavLinks(this.sidebarMenus, this.props.basePath);
  }

  private hasGeneralReadRole(): boolean {
    return AuthStore.permissions.hasAnyRole([ 'general_manager', 'general_reader' ]);
  }

  public render(): ReactNode {
    return (
      <Routes>
        <Route path="general/*">
          {!this.hasGeneralReadRole() && <Route index element={<NoPermissionPage />} />}
          <Route index
            element={
              <ProtectedRoute
                element={<CoreModule />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="mobile-releases"
            element={
              <ProtectedRoute
                element={<MobileRelease />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="fuel"
            element={
              <ProtectedRoute
                element={<Fuel />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="system-messages"
            element={
              <ProtectedRoute
                element={<UVGOBanner />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="scott-ipc"
            element={
              <ProtectedRoute
                element={<ScottIPC />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="uvGO-settings"
            element={
              <ProtectedRoute
                element={<UVGOSettings />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="uvGO-settings/:mode"
            element={
              <ProtectedRoute
                element={<UvgoSettingEditor key={'uvgo-setting'} />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="uvGO-settings/:id/:mode"
            element={
              <ProtectedRoute
                element={<UvgoSettingEditor key={'uvgo-setting-view'} />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="feature-notes"
            element={
              <ProtectedRoute
                element={<FeatureNote />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="feature-notes/:id/:mode"
            element={
              <ProtectedRoute
                element={<FeatureNoteEditor />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="active-uvgo-users"
            element={
              <ProtectedRoute
                element={<ActiveUsers />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="sync-History"
            element={
              <ProtectedRoute
                element={<SyncHistory />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route path="sync-troubleshoot" 
            element={
              <ProtectedRoute
                element={<SyncTroubleshoot />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="sync-settings"
            element={
              <ProtectedRoute
                element={<SyncSettings />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route
            path="retail-data"
            element={
              <ProtectedRoute
                element={<RetailData />}
                hasPermission={this.hasGeneralReadRole()}
                redirectPath={this.redirectPath}
              />
            }
          />
          <Route path="*" element={<NotFoundPage fullScreen={true} />} />
        </Route>
      </Routes>
    );
  }
}
export default GeneralApp;

import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component, LazyExoticComponent, ReactNode, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SubscriptionsOutlined } from '@material-ui/icons';
import BlockIcon from '@material-ui/icons/Block';
import CategoryIcon from '@material-ui/icons/Category';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import EventIcon from '@material-ui/icons/Event';
import ListAltIcon from '@material-ui/icons/ListAlt';
import MessageIcon from '@material-ui/icons/Message';
import PortraitIcon from '@material-ui/icons/Portrait';
import WarningIcon from '@material-ui/icons/Warning';
import { IBaseModuleProps } from '@wings/shared';
import { AuthStore, SettingsModuleSecurity } from '@wings-shared/security';
import { CoreModule } from './Modules';
import { NotificationsModuleSecurity } from './Modules/Shared';
import { NotFoundPage } from '@wings-shared/core';
import { INavigationLink, ProtectedRoute } from '@wings-shared/layout';

interface IModule {
  lazyComponent: LazyExoticComponent<any>;
  path: string;
  allowRoute: boolean;
}

@inject('sidebarStore')
@observer
class NotificationsApp extends Component<IBaseModuleProps> {
  @observable private sidebarMenus: INavigationLink[] = [
    {
      to: 'events',
      isHidden: !NotificationsModuleSecurity.isEditable,
      title: 'Event',
      icon: <EventIcon />,
    },
    {
      to: 'user-subscriptions',
      isHidden: !NotificationsModuleSecurity.isEditable,
      title: 'User Subscription',
      icon: <SubscriptionsOutlined />,
    },
    {
      to: 'templates',
      isHidden: !NotificationsModuleSecurity.isEditable,
      title: 'Template',
      icon: <PortraitIcon />,
    },
    { to: 'eventTypes', title: 'EventType', icon: <WarningIcon /> },
    { to: 'dndFilters', title: 'DND Filter', icon: <BlockIcon /> },
    { to: '', title: 'Channel', icon: <DeviceHubIcon /> },
    {
      to: 'execution-summary',
      isHidden: !NotificationsModuleSecurity.isEditable,
      title: 'Execution Summary',
      icon: <ListAltIcon />,
    },
    {
      to: 'integration',
      title: 'Integration',
      icon: <CodeOutlinedIcon />,
    },
    {
      to: 'category',
      title: 'Category',
      icon: <CategoryIcon />,
    },
    {
      to: 'system-message',
      title: 'System Message',
      icon: <MessageIcon />,
    },
  ];

  constructor(props) {
    super(props);
    NotificationsModuleSecurity.init();
    SettingsModuleSecurity.updatePermissions();
    AuthStore.configureAgGrid();
  }

  componentDidMount(): void {
    this.props.sidebarStore.setNavLinks(this.sidebarMenus, this.props.basePath);
  }

  /* istanbul ignore next */
  private get _modules(): IModule[] {
    return [
      {
        lazyComponent: React.lazy(() => import(/* webpackChunkName: "event-type" */ './Modules/EventType/EventType')),
        path: 'eventTypes',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "event-type-editor" */
            './Modules/EventType/Components/EventTypeEditor/EventTypeEditor'
          )
        ),
        path: 'eventTypes/:mode',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "event-type-editor" */
            './Modules/EventType/Components/EventTypeEditor/EventTypeEditor'
          )
        ),
        path: 'eventTypes/:id/:mode',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() => import(/* webpackChunkName: "template" */ './Modules/Template/Template')),
        path: 'templates',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "template-editor" */ './Modules/Template/Components/TemplateEditor/TemplateEditor'
          )
        ),
        path: 'templates/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "template-editor" */ './Modules/Template/Components/TemplateEditor/TemplateEditor'
          )
        ),
        path: 'templates/:id/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "template-preview" */ './Modules/Template/Components/TemplatePreview/TemplatePreview'
          )
        ),
        path: 'templates/preview/:id',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "template-root-editor" */
            './Modules/Template/Components/RootEmailTemplate/RootEmailTemplate'
          )
        ),
        path: 'templates/email-root/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() => import(/* webpackChunkName: "event" */ './Modules/Event/Event')),
        path: 'events',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "event-editor" */ './Modules/Event/Components/EventEditor/EventEditor')
        ),
        path: 'events/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "event-editor" */ './Modules/Event/Components/EventEditor/EventEditor')
        ),
        path: 'events/:id/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "user-subscription" */ './Modules/UserSubscription/UserSubscriptionTabs')
        ),
        path: 'user-subscriptions',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "contact" */ './Modules/UserSubscription/Components/Contact/Contact')
        ),
        path: 'user-subscriptions/contacts',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() => import(/* webpackChunkName: "dndFilter" */ './Modules/DNDFilter/DNDFilter')),
        path: 'dndFilters',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "dndFilter-editor" */
            './Modules/DNDFilter/Components/DNDFilterEditor/DNDFilterEditor'
          )
        ),
        path: 'dndFilters/:mode',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "dndFilter-editor" */
            './Modules/DNDFilter/Components/DNDFilterEditor/DNDFilterEditor'
          )
        ),
        path: 'dndFilters/:id/:mode',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "execution-summary" */ './Modules/ExecutionSummary/ExecutionSummary')
        ),
        path: 'execution-summary',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "execution-summary" */ './Modules/ExecutionSummary/ExecutionSummary')
        ),
        path: 'events/:eventId/execution-summary',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "one-time-event" */ './Modules/Event/Components/OneTimeEvent/OneTimeEvent')
        ),
        path: 'events/one-time/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "one-time-event" */ './Modules/Event/Components/OneTimeEvent/OneTimeEvent')
        ),
        path: 'events/:id/one-time/:mode',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "execution-summary-details" */
            './Modules/ExecutionSummary/Components/ExecutionSummaryDetails/ExecutionSummaryDetails'
          )
        ),
        path: 'execution-summary/:id',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(
            /* webpackChunkName: "execution-summary-details" */
            './Modules/ExecutionSummary/Components/ExecutionSummaryDetails/ExecutionSummaryDetails'
          )
        ),
        path: 'execution-summary/:id/:eventId',
        allowRoute: NotificationsModuleSecurity.isEditable,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "integration" */ './Modules/Event/Components/EventEditor/EventEditor')
        ),
        path: 'integration',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() => import(/* webpackChunkName: "category" */ './Modules/Category/Category')),
        path: 'category',
        allowRoute: true,
      },
      {
        lazyComponent: React.lazy(() =>
          import(/* webpackChunkName: "system-message" */ './Modules/SystemMessage/SystemMessage')
        ),
        path: 'system-message',
        allowRoute: true,
      },
    ];
  }

  /* istanbul ignore next */
  public get lazyRoutes(): ReactNode[] {
    return this._modules.map(m => {
      const LazyComponent = m.lazyComponent as React.FC<{ basePath: string }>;
      return (
        <Route
          key={m.path}
          path={`${m.path}/*`}
          element={
            <ProtectedRoute
              hasPermission={m.allowRoute}
              redirectPath="/notifications"
              key={`${m}-notifications`}
              element={<LazyComponent basePath={m.path} />}
            />
          }
        />
      );
    });
  }

  public render(): ReactNode {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="notifications/*">
            <Route index element={<CoreModule />} />
            {this.lazyRoutes}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }
}
export default NotificationsApp;

import React, { Component, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { inject } from 'mobx-react';
import CoreModule from './Modules/Core/Core.module';
import { IBaseModuleProps } from '@wings/shared';
import { AuthStore } from '@wings-shared/security';
import { SurveyDashboardIcon } from '@uvgo-shared/icons';
import { INavigationLink } from '@wings-shared/layout';
import { NotFoundPage } from '@wings-shared/core';

const sidebarMenu: INavigationLink[] = [
  { to: '', title: 'Survey Dashboard', icon: <SurveyDashboardIcon size="large" /> },
];

@inject('sidebarStore')
export default class AirportLogistics extends Component<IBaseModuleProps> {
  constructor(props) {
    super(props);
    this.props.sidebarStore?.setNavLinks(sidebarMenu, this.props.basePath);
    AuthStore.configureAgGrid();
  }

  public render(): ReactNode {
    return (
      <Routes>
        <Route path="airport-logistics/*" element={<CoreModule />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }
}

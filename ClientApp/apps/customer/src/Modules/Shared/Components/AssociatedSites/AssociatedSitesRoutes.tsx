import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { associatedSiteSidebarOptions, customerSidebarOptions } from '../../../Shared';
import { ViewPermission } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { useParams } from 'react-router';
import AssociatedSiteGeneralInformation from './AssociatedSiteGeneralInformation/AssociatedSiteGeneralInformation';

interface Props extends IBaseModuleProps {
  sidebarStore?: typeof SidebarStore;
}

const AssociatedSitesRoutes: FC<Props> = props => {
  const params = useParams();
  const customerNumber = params.customerNumber;
  const siteId = params.siteId;
  const associatedSiteBasePath = `customer/upsert/${customerNumber}/${params.viewMode}/associated-bill-to-sites/${siteId}/${params.siteViewMode}`;

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(associatedSiteSidebarOptions(), associatedSiteBasePath);
    return () => {
      props.sidebarStore?.setNavLinks(
        customerSidebarOptions(false, true),
        `customer/upsert/${customerNumber}/${params.viewMode}`
      );
    };
  }, []);

  return (
    <ViewPermission hasPermission={true}>
      <Routes>
        <Route index element={<AssociatedSiteGeneralInformation key="associated-sites-info" />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore')(observer(AssociatedSitesRoutes));

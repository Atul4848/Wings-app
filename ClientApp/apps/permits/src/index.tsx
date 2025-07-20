import React, { useEffect } from 'react';
import { Settings, CoreModule, ExecuteRule, PermitInfoReview, PermitInfoReviewDetails } from './Modules';
import { IBaseModuleProps } from '@wings/shared';
import { Routes, Route } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { usePermitModuleSecurity } from './Modules/Shared';
import { PermitRoutes } from './Modules/Core/Components';
import { NotFoundPage, SearchStore } from '@wings-shared/core';
import { ProtectedRoute } from '@wings-shared/layout';

const PermitsApp = (props: IBaseModuleProps) => {
  const redirectPath: string = '/permits';
  const permitModuleSecurity = usePermitModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="permits/*">
        <Route index element={<CoreModule />} />
        <Route path="settings" element={<Settings />} />
        <Route path="executeRules" element={<ExecuteRule />} />
        <Route
          path=":viewMode/*"
          key="permitAdd"
          element={
            <ProtectedRoute
              element={<PermitRoutes key={'permit-add'} />}
              redirectPath={redirectPath}
              hasPermission={permitModuleSecurity.isEditable}
            />
          }
        />
        <Route path=":permitId/:viewMode/*" element={<PermitRoutes key={'permit-edit'} />} />
        <Route path="permit-info-review" element={<PermitInfoReview />} />
        <Route
          path="permit-info-review/:id/:permitInfoId/review-details"
          element={<PermitInfoReviewDetails key={'permit-info-review-details'} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(PermitsApp));

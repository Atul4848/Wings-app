import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AssociatedCustomers, OperatorModel, OperatorStore, customerSidebarOptions } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, ViewPermission } from '@wings-shared/core';
import { useParams } from 'react-router';
import { OperatorGeneralInformation } from '../index';

interface Props extends Partial<IBaseModuleProps> {
  operatorStore?: OperatorStore;
}

const UpsertOperator: FC<Props> = props => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const operatorId = Number(params.operatorId);
  const _operatorStore = props.operatorStore as OperatorStore;
  const operatorTitle = _operatorStore.selectedOperator.name;
  const operatorBasePath = `customer/operator/${operatorId}/${params.viewMode}`;

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(customerSidebarOptions(false), operatorBasePath);
    loadOperator();
    return () => {
      _operatorStore.selectedOperator = new OperatorModel();
    };
  }, []);

  /* istanbul ignore next */
  const loadOperator = (): void => {
    if (!operatorId) {
      unsubscribe.setHasLoaded(true);
      return;
    }
    UIStore.setPageLoader(true);
    _operatorStore
      .getOperatorById(operatorId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _operatorStore.selectedOperator = response;
        unsubscribe.setHasLoaded(true);
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<OperatorGeneralInformation key="operator-info" title={operatorTitle} />} />
        <Route
          path="associated-customers"
          element={
            <AssociatedCustomers title={operatorTitle} backNavTitle="Operator" backNavLink="/customer/operator" />
          }
        />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'operatorStore')(observer(UpsertOperator));

import { IBaseModuleProps, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CountryStore, countrySidebarOptions, upsertTabBasePathFinder } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { useParams } from 'react-router';
import {
  AssociatedAIP,
  AssociatedFIRs,
  AssociatedRegions,
  CountryGeneralInformation,
  OperationalRequirements,
} from '../index';

interface Props extends Partial<IBaseModuleProps> {
  countryStore?: CountryStore;
}

const UpsertCountry: FC<Props> = props => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const countryId = params.countryId || '';
  const _countryStore = props.countryStore as CountryStore;

  /* istanbul ignore next */
  useEffect(() => {
    const paths = countrySidebarOptions(false, !Boolean(countryId)).map(x => x.to);
    props.sidebarStore?.setNavLinks(countrySidebarOptions(false, !Boolean(countryId)), upsertTabBasePathFinder(paths));
    loadCountry();
    return () => {
      _countryStore.selectedCountry = null;
    };
  }, []);

  /* istanbul ignore next */
  const loadCountry = (): void => {
    if (!countryId) {
      unsubscribe.setHasLoaded(true);
      return;
    }
    UIStore.setPageLoader(true);
    _countryStore
      ?.getCountryById(Number(countryId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _countryStore.selectedCountry = response;
        unsubscribe.setHasLoaded(true);
      });
  };

  const countryTitle = _countryStore.selectedCountry?.label;

  const isEditable = (): boolean => {
    return Utilities.isEqual(params.viewMode || '', VIEW_MODE.EDIT || VIEW_MODE.NEW);
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<CountryGeneralInformation key={'country-info'} />} />
        <Route
          path="associated-regions"
          element={<AssociatedRegions isEditable={isEditable()} title={countryTitle} />}
        />
        <Route
          path="associated-aips"
          element={
            <AssociatedAIP
              countryId={Number(countryId)}
              params={params as any}
              isEditable={isEditable()}
              title={countryTitle}
            />
          }
        />
        <Route path="associated-firs" element={<AssociatedFIRs countryId={Number(countryId)} title={countryTitle} />} />
        <Route path="operational-requirements/*" element={<OperationalRequirements title={countryTitle} />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'countryStore')(observer(UpsertCountry));

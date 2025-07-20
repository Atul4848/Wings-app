import React, { useState, FC } from 'react';
import { inject, observer } from 'mobx-react';
import {
  AssociatedRegionModel,
  CountryStore,
  RegionStore,
  SettingsStore,
  upsertCountryBackNavLink,
} from '../../../Shared';
import { Observable, of } from 'rxjs';
import { tapWithAction } from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useParams } from 'react-router';
import AssociatedRegion from '../../../Region/AssociatedRegion/AssociatedRegion';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
  regionStore?: RegionStore;
  isEditable?: boolean;
  title: string;
  params?: { countryId: string; continentId: string };
}

const AssociatedRegions: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const [ associatedRegions, setAssociatedRegions ] = useState<AssociatedRegionModel[]>([]);
  const _regionStore = props.regionStore as RegionStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _countryStore = props.countryStore as CountryStore;

  /* istanbul ignore next */
  const loadAssociatedRegions = (regionId: number, countryId: number): Observable<AssociatedRegionModel[]> => {
    if (associatedRegions.length) {
      return of(associatedRegions);
    }

    return _regionStore
      ?.getAssociatedRegions(regionId, countryId)
      .pipe(tapWithAction(associatedRegions => setAssociatedRegions(associatedRegions)));
  };

  /* istanbul ignore next */
  const headerActions = () => {
    return (
      <DetailsEditorHeaderSection
        title={props.title}
        backNavLink={params && upsertCountryBackNavLink(Number(params.continentId))}
        backNavTitle={params?.countryId ? 'Countries' : 'Continents'}
        isEditMode={false}
        showBreadcrumb={Boolean(params?.continentId)}
      />
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={headerActions()}
      isEditMode={false}
      isBreadCrumb={Boolean(params?.continentId)}
    >
      <AssociatedRegion
        countryModel={_countryStore?.selectedCountry}
        isEditable={props.isEditable}
        getAssociatedRegions={(regionId: number, countryId: number) => loadAssociatedRegions(regionId, countryId)}
        countryStore={_countryStore}
        regionStore={_regionStore}
        settingsStore={_settingsStore}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('countryStore', 'settingsStore', 'regionStore', 'sidebarStore')(observer(AssociatedRegions));

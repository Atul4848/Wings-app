import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import {
  AeronauticalInformationPublication,
  Region,
  State,
  CoreModule,
  City,
  Island,
  FIRsOwn,
  Metro,
  Continent,
  Settings,
  CabotageReview,
} from './Modules';
import { IBaseModuleProps, Bulletins, UpsertBulletin, NO_SQL_COLLECTIONS, BulletinsReview } from '@wings/shared';
import { AuthStore } from '@wings-shared/security';
import { Routes, Route } from 'react-router-dom';
import { countrySidebarOptions, updateCountrySidebarOptions } from './Modules/Shared';
import { useCountryModuleSecurity } from './Modules/Shared/Tools';
import { UpsertCountry } from './Modules/Core/Components';
import { NotFoundPage, SearchStore } from '@wings-shared/core';
import { ProtectedRoute } from '@wings-shared/layout';

const CountryApp = (props: IBaseModuleProps) => {
  const redirectPath: string = '/countries';
  const countryModuleSecurity = useCountryModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    AuthStore.configureAgGrid();
    return () => {
      SearchStore.clearSearch();
    };
  }, []);

  return (
    <Routes>
      <Route path="countries/*">
        <Route index element={<CoreModule key={'countries'} />} />
        <Route path="upsert/:viewMode/*" element={<UpsertCountry key={'country-add'} />} />
        <Route
          path="continents/:continentId/countries/upsert/:viewMode/*"
          element={<UpsertCountry key={'country-add-from-continent'} />}
        />
        <Route path="upsert/:countryId/:viewMode/*" element={<UpsertCountry key={'country-details-and-update'} />} />
        <Route path="continents/:continentId/upsert/:viewMode/*" element={<UpsertCountry key={'continent-view'} />} />
        <Route
          path="continents/:continentId/countries/upsert/:countryId/:viewMode/*"
          element={<UpsertCountry key={'continent-detail-and-update'} />}
        />
        <Route
          // changed path from ':continent/'
          path="continents/:continentId/countries"
          element={<CoreModule key={'continent-countries'} />}
        />
        <Route
          // changed path from ':continent/'
          path="continents/:continentId/countries"
          element={<CoreModule key={'continent-countries'} />}
        />
        <Route path="firs" element={<FIRsOwn />} />
        <Route path="states" element={<State key={'states'} />} />
        <Route path=":countryId/states" element={<State key={'states-with-country'} />} />
        {/* added one more route for*/}
        <Route
          path="continents/:continentId/countries/:countryId/states"
          element={<State key={'states-with-continent-and-country'} />}
        />
        <Route path="cities" element={<City key={'cities'} />} />
        <Route path="states/:stateId/cities" element={<City key={'cities-with-states'} />} />
        <Route path=":countryId/states/:stateId/cities" element={<City key={'cities-with-country-and-states'} />} />
        <Route
          path="continents/:continentId/countries/:countryId/states/:stateId/cities"
          element={<City key={'cities-with-continent-and-country-and-states'} />}
        />
        <Route path="islands" element={<Island key={'islands'} />} />
        <Route path=":countryId/islands" element={<Island key={'island-with-country'} />} />
        {/* added more routes for*/}
        <Route path="states/:stateId/islands" element={<Island key={'island-with-states'} />} />
        <Route path=":countryId/states/:stateId/islands" element={<Island key={'islands-with-country-and-state'} />} />
        <Route
          path="continents/:continentId/countries/:countryId/islands"
          element={<Island key={'islands-with-continent-and-country'} />}
        />
        <Route
          path="continents/:continentId/countries/:countryId/states/:stateId/islands"
          element={<Island key={'islands-with-continent-and-country-and-state'} />}
        />

        <Route path="regions" element={<Region />} />
        <Route path="continents" element={<Continent />} />
        <Route path="metros" element={<Metro />} />
        <Route
          path="aeronautical-information"
          element={
            <ProtectedRoute
              element={<AeronauticalInformationPublication />}
              hasPermission={countryModuleSecurity.isEditable}
              redirectPath={redirectPath}
            />
          }
        />
        <Route
          path="bulletins"
          element={
            <Bulletins
              defaultSidebarOptions={countrySidebarOptions}
              basePath="/countries"
              securityModule={countryModuleSecurity}
              collectionName={NO_SQL_COLLECTIONS.COUNTRY_BULLETIN}
            />
          }
        />
        <Route
          path="bulletins/:viewMode"
          key="bulletin-detail"
          element={
            <UpsertBulletin
              isCountryBulletins={true}
              updatedSidebarOptions={() => updateCountrySidebarOptions('Bulletins')}
              defaultSidebarOptions={countrySidebarOptions}
              securityModule={countryModuleSecurity}
              basePath="/countries"
              key={'bulletin-view'}
            />
          }
        />
        <Route
          path="bulletins/:bulletinId/:viewMode"
          key="bulletin-mode"
          element={
            <UpsertBulletin
              isCountryBulletins={true}
              updatedSidebarOptions={updateCountrySidebarOptions}
              defaultSidebarOptions={countrySidebarOptions}
              key={'bulletin-details'}
              securityModule={countryModuleSecurity}
              basePath="/countries"
            />
          }
        />
        <Route
          path="purged-bulletins"
          element={
            <Bulletins
              purgedBulletins={true}
              defaultSidebarOptions={countrySidebarOptions}
              securityModule={countryModuleSecurity}
              basePath="/countries"
              key={'purged-bulletins'}
              collectionName={NO_SQL_COLLECTIONS.COUNTRY_BULLETIN}
            />
          }
        />
        <Route
          path="purged-bulletins/:purgedBulletinId/:viewMode"
          element={
            <UpsertBulletin
              purgedBulletins={true}
              updatedSidebarOptions={() => updateCountrySidebarOptions('Purged Bulletins')}
              defaultSidebarOptions={countrySidebarOptions}
              securityModule={countryModuleSecurity}
              basePath="/countries"
              key={'purged-bulletin-details'}
              isCountryBulletins={true}
            />
          }
        />
        <Route
          path="bulletins-review"
          element={
            <BulletinsReview
              isAirport={false}
              securityModule={countryModuleSecurity}
              key={'country-bulletin-review'}
              defaultSidebarOptions={countrySidebarOptions}
              basePath="/countries"
            />
          }
        />
        <Route
          path="cabotage-review"
          element={
            <CabotageReview
              key={'cabotage-review'}
            />
          }
        />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default inject('sidebarStore')(observer(CountryApp));

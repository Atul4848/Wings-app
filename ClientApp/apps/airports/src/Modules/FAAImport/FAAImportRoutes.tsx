import React, { FC, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { Route, Routes } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { AirportStore, FAA_IMPORT_STAGING_ENTITY_TYPE } from '../Shared';
import { NavigateFunction, useParams } from 'react-router';
import { takeUntil, finalize } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import FAAFileDetails from './FAAFileDetails/FAAFileDetails';
import { UIStore, ViewPermission } from '@wings-shared/core';
import FAACompareFileDetailsV2 from './FAACompareFileDetails/FAACompareFileDetailsV2';

interface RouteProps {
  navigate?: NavigateFunction;
  params?: {
    viewMode: VIEW_MODE;
    id: number;
    processId: string;
  };
  airportStore?: AirportStore;
}

const FAAImportRoutes: FC<RouteProps> = ({ airportStore }: RouteProps) => {
  const unsubscribe = useUnsubscribe();
  const [ hasLoaded, setHasLoaded ] = useState(false);
  const params = useParams();

  useEffect(() => {
    loadFAAImportData();
  }, []);

  /* istanbul ignore next */
  const loadFAAImportData = () => {
    if (!params.id) {
      setHasLoaded(true);
      return;
    }

    if (airportStore) {
      UIStore.setPageLoader(true);
      airportStore
        .getFAAImportProcessById(parseInt(params.id))
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            setHasLoaded(true);
          })
        )
        .subscribe(response => {
          airportStore.selectedFaaImportProcess = response;
        });
    }
  };

  return (
    <ViewPermission hasPermission={hasLoaded}>
      {/*Base Path for this routes  /airports/import-faa/${id}/${processId} */}
      <Routes>
        <Route
          index
          path="airports"
          element={<FAAFileDetails key={'airports'} entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT} />}
        />
        <Route
          path="airports/:stagingTableId/:sourceLocationId/review-details"
          element={
            <FAACompareFileDetailsV2 key={'review-airports'} entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT} />
          }
        />
        {/* Show Runways for specific Airport based on Source Location Id */}
        <Route
          path="airports/:stagingTableId/:sourceLocationId/review-details/runways"
          element={
            <FAAFileDetails
              entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS}
              key={'review-details-runways'}
              isRunwayBySourceLocation={true}
            />
          }
        />
        <Route
          path="frequencies"
          element={<FAAFileDetails entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.FREQUENCY} key={'frequencies'} />}
        />
        <Route
          path="frequencies/:stagingTableId/:sourceLocationId/review-details"
          element={
            <FAACompareFileDetailsV2 key={'review-frequencies'} entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.FREQUENCY} />
          }
        />
        <Route
          path="runways"
          element={<FAAFileDetails entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS} key={'runways'} />}
        />
        <Route
          path="runways/:stagingTableId/:sourceLocationId/review-details" // Show Runway Details
          element={
            <FAACompareFileDetailsV2 key={'review-runways'} entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS} />
          }
        />
        {/* // Show Runway Details */}
        <Route
          path="airports/:stagingTableId/:sourceLocationId/review-details/runways/source-location/review-details" 
          element={
            <FAACompareFileDetailsV2
              key={'review-runways-source-location'}
              entityType={FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS}
              isRunwayBySourceLocation={true}
            />
          }
        />
      </Routes>
    </ViewPermission>
  );
};

export default inject('airportStore')(observer(FAAImportRoutes));

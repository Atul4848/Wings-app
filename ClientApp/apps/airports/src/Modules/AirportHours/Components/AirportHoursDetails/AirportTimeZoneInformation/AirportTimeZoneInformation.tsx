import React, { FC, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { AirportHoursStore, ATSAirportModel } from '../../../../Shared';
import { styles } from './AirportTimeZoneInformation.styles';
import { inject } from 'mobx-react';
import { Observable, of } from 'rxjs';
import { IAPIGridRequest, Utilities, ViewPermission } from '@wings-shared/core';

interface Props {
  icaoOrUwaCode: string;
  airportHoursStore?: AirportHoursStore;
}

const AirportTimeZoneInformation: FC<Props> = ({ icaoOrUwaCode, airportHoursStore }: Props) => {
  const [ airport, setAirport ] = useState<ATSAirportModel>();
  const _airportHoursStore = airportHoursStore as AirportHoursStore;
  const classes = styles();
  /* istanbul ignore next */
  const getAirportTimeZoneDetails = (): Observable<ATSAirportModel[]> => {
    if (!icaoOrUwaCode) {
      _airportHoursStore.tfoAirports = [];
      return of([]);
    }
    const searchCollection: IAPIGridRequest = {
      searchCollection: JSON.stringify([ Utilities.getFilter('ICAO', icaoOrUwaCode) ]),
      sortCollection: JSON.stringify([
        { propertyName: 'ICAO', isAscending: true },
        { propertyName: 'Inactive', isAscending: true },
      ]),
    };
    return _airportHoursStore.loadTfoAirports({ ...searchCollection, pageSize: 50 });
  };
  // Get Updated information
  /* istanbul ignore next */
  useEffect(() => {
    const sub = getAirportTimeZoneDetails().subscribe(() => {
      const tfoAirport = _airportHoursStore.tfoAirports.find(x => Utilities.isEqual(x.icao, icaoOrUwaCode));
      setAirport(tfoAirport);
    });
    // unsubscribe events
    return () => {
      sub.unsubscribe();
    };
  }, [ icaoOrUwaCode ]);

  if (!airport) {
    return null;
  }

  if (!airport.utcToSDTMessage && !airport.utcToDSTMessage) {
    return <Typography>NOT AVAILABLE</Typography>;
  }

  return (
    <div className={classes.root}>
      <div className={classes.sdtDstContainer}>
        <ViewPermission hasPermission={Boolean(airport.utcToSDTMessage)}>
          <div className={classes.sdtInformation}>
            <Typography variant="body2">
              <strong>SDT</strong> UTC {airport.utcToStandardTimeConversion}
            </Typography>
            <Typography variant="body2" dangerouslySetInnerHTML={{ __html: airport.utcToSDTMessage }} />
          </div>
        </ViewPermission>
        <ViewPermission hasPermission={Boolean(airport.utcToDSTMessage)}>
          <div className={classes.dstInformation}>
            <Typography variant="body2">
              <strong>DST</strong> UTC {airport.utcToDaylightSavingsConversion}
            </Typography>
            <Typography variant="body2" dangerouslySetInnerHTML={{ __html: airport.utcToDSTMessage }} />
          </div>
        </ViewPermission>
      </div>
    </div>
  );
};
export { AirportTimeZoneInformation as PureAirportTimeZoneInformation };
export default inject('airportHoursStore')(AirportTimeZoneInformation);

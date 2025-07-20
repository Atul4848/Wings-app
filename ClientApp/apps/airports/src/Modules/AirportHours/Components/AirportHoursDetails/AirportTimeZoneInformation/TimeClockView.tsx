import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AirportTimezoneModel } from '../../../../Shared/Models';
import { useStyles } from './AirportTimeZoneInformation.styles';

interface Props {
  timeZoneOffset: string;
}

export const TimeClockView = ({ timeZoneOffset }: Props) => {
  const airportTimeRef = useRef<NodeJS.Timer>();
  const classes = useStyles();
  const offsetInMinutes = useMemo(() => AirportTimezoneModel.getOffsetInMinutes(timeZoneOffset), [ timeZoneOffset ]);

  const [ airportTime, setAirportTime ] = useState(moment.utc().add(offsetInMinutes, 'minutes'));

  /* istanbul ignore next */
  useEffect(() => {
    const time = moment.utc().add(offsetInMinutes, 'minutes');
    airportTimeRef.current = setInterval(() => setAirportTime(time), 1000);
    return () => {
      clearInterval(airportTimeRef.current);
    };
  }, [ airportTime ]);

  return (
    <>
      <div>
        Offset From UTC <strong>{timeZoneOffset}</strong>
      </div>
      <div>
        {airportTime.format('DD-MMM-YY')} <strong>{airportTime.format('LTS')}</strong>
      </div>
    </>
  );
};

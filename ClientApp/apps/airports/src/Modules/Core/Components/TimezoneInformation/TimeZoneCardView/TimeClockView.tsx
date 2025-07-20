import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Typography } from '@material-ui/core';
import moment from 'moment';
import { AirportTimezoneModel } from '../../../../Shared/Models';

interface Props {
  timeZoneOffset: string;
}

export const TimeClockView = ({ timeZoneOffset }: Props) => {
  const airportTimeRef = useRef<NodeJS.Timer>();

  const offsetInMinutes = useMemo(() => AirportTimezoneModel.getOffsetInMinutes(timeZoneOffset), [ timeZoneOffset ]);

  const [ airportTime, setAirportTime ] = useState(moment.utc().add(offsetInMinutes, 'minutes'));

  useEffect(() => {
    const _time = moment.utc().add(offsetInMinutes, 'minutes');
    airportTimeRef.current = setInterval(() => setAirportTime(_time), 1000);
    return () => {
      clearInterval(airportTimeRef.current);
    };
  }, [ airportTime ]);

  return (
    <>
      <Typography variant="body2">{airportTime.format('dddd LL')}</Typography>
      <Typography variant="body1" align="center">
        <strong>{airportTime.format('LTS')}</strong>
      </Typography>
    </>
  );
};

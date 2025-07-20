import React, { FC, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { AirportModel, AirportStore, AirportTimezoneModel } from '../../../../Shared';
import { inject, observer } from 'mobx-react';
import { IAPIGridRequest, ViewPermission } from '@wings-shared/core';
import { useStyles } from './AirportTimeZoneInformation.styles';
import { TimeClockView } from './TimeClockView';
import moment from 'moment';
interface Props {
  icaoOrUwaCode: string;
  airportStore?: AirportStore;
}

const AirportTimeZoneInformationV2: FC<Props> = ({ icaoOrUwaCode, airportStore }: Props) => {
  const [ airport, setAirport ] = useState<AirportModel>();
  const classes = useStyles();
  const currentDateTime = moment();
  const _airportStore = airportStore as AirportStore;

  const offsetDifference = offset => {
    return offset ? `Offset From UTC <strong>${offset}</strong>` : 'No Data Available';
  };

  // Get Updated information
  useEffect(() => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 50,
      searchCollection: JSON.stringify([
        { propertyName: 'ICAOCode.Code', propertyValue: icaoOrUwaCode },
        { propertyName: 'UWACode', propertyValue: icaoOrUwaCode, operator: 'or' },
        { propertyName: 'DisplayCode', propertyValue: icaoOrUwaCode, operator: 'or' },
      ]),
    };
    const sub = _airportStore.getAirports(request).subscribe(response => {
      if (response.results.length) {
        setAirport(response.results[0]);
      }
    });
    //unsubscribe events
    return () => {
      sub.unsubscribe();
    };
  }, [ icaoOrUwaCode ]);

  if (!airport) {
    return null;
  }

  const timeZone = airport?.timezoneInformation;
  const data = { ...timeZone?.currentTime, startDate: '', endDate: '', hasStartEndTimeAvailable: false };

  /* istanbul ignore next */
  const getTimeDifferenceNew = (timeZone: AirportTimezoneModel): string => {
    if (!timeZone?.currentTime?.zoneDiff) {
      return 'No Data Available';
    }
    const airportOffsetMinutes = AirportTimezoneModel.getOffsetInMinutes(timeZone.currentTime?.zoneDiff);
    const userLocalOffsetMinutes = AirportTimezoneModel.getOffsetInMinutes(moment().format('Z'));
    const currentTime = moment.utc().add(airportOffsetMinutes, 'minutes');
    const userLocalTime = moment.utc().add(userLocalOffsetMinutes, 'minutes');
    // Calculate the time difference in minutes
    // We are not using hours as moment js ignore .5 value i.e 3:30 it will return only 3
    const timeDifference = currentTime.diff(userLocalTime, 'minutes');

    if (timeDifference === 0) {
      return 'No Difference in Time Zones';
    }
    return `<strong>${Math.abs(timeDifference / 60)}</strong> hour(s) ${
      timeDifference > 0 ? 'ahead' : 'behind'
    } Current Time`;
  };

  if (!timeZone?.dst?.zoneDiff && !timeZone?.sdt?.zoneDiff) {
    return <Typography>NOT AVAILABLE</Typography>;
  }

  return (
    <div className={classes.root}>
      <div className={classes.sdtDstContainer}>
        <ViewPermission hasPermission={Boolean(timeZone.sdt)}>
          <div className={classes.sdtInformation}>
            <div dangerouslySetInnerHTML={{ __html: offsetDifference(timeZone.sdt.zoneDiff) }} />
            <ViewPermission hasPermission={Boolean(timeZone.sdt.startDate || timeZone.sdt.endDate)}>
              <>
                <ViewPermission hasPermission={Boolean(timeZone.sdt.startDate)}>
                  <div>
                    <span>{timeZone.sdt.timeType} Starts </span>
                    <strong>
                      {timeZone.sdt.startDate} {timeZone.sdt.startTime}
                    </strong>
                  </div>
                </ViewPermission>
                <ViewPermission hasPermission={Boolean(timeZone.sdt.endDate)}>
                  <div>
                    <span>{timeZone.sdt.timeType} Ends </span>
                    <strong>
                      {timeZone.sdt.endDate} {timeZone.sdt.endTime}
                    </strong>
                  </div>
                </ViewPermission>
              </>
            </ViewPermission>
          </div>
        </ViewPermission>
        <ViewPermission hasPermission={Boolean(timeZone.hasDst)}>
          <div className={classes.dstInformation}>
            <div dangerouslySetInnerHTML={{ __html: offsetDifference(timeZone.dst.zoneDiff) }} />
            <ViewPermission hasPermission={Boolean(timeZone.dst.startDate || timeZone.dst.endDate)}>
              <>
                <ViewPermission hasPermission={Boolean(timeZone.dst.startDate)}>
                  <div>
                    <span>{timeZone.dst.timeType} Starts </span>
                    <strong>
                      {timeZone.dst.startDate} {timeZone.dst.startTime}
                    </strong>
                  </div>
                </ViewPermission>
                <ViewPermission hasPermission={Boolean(timeZone.dst.endDate)}>
                  <div>
                    <span>{timeZone.dst.timeType} Ends </span>
                    <strong>
                      {timeZone.dst.endDate} {timeZone.dst.endTime}
                    </strong>
                  </div>
                </ViewPermission>
              </>
            </ViewPermission>
          </div>
        </ViewPermission>
        <div className={classes.commonStyle}>
          <Typography variant="caption" color="primary">
            <strong>Airport Time</strong>
          </Typography>
          <TimeClockView timeZoneOffset={data?.zoneDiff || ''} />
        </div>
        <div className={classes.commonStyle}>
          <Typography variant="caption" color="primary">
            <strong>My Current Time</strong>
          </Typography>
          <TimeClockView timeZoneOffset={currentDateTime.format('Z')} />
        </div>
        <ViewPermission hasPermission={Boolean(timeZone.currentTime?.zoneDiff)}>
          <div className={classes.commonStyle}>
            <Typography variant="caption" color="primary">
              <strong>Time Difference</strong>
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: getTimeDifferenceNew(timeZone) }} />
          </div>
        </ViewPermission>
      </div>
    </div>
  );
};
export default inject('airportStore')(observer(AirportTimeZoneInformationV2));

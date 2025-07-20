import React from 'react';
import { Card, Typography } from '@material-ui/core';
import { AirportTimeZoneInformationModel } from '../../../../Shared/Models';
import { useStyles } from './TimeZoneCardView.styles';
import moment from 'moment';
import { ViewPermission } from '@wings-shared/core';
import { TimeClockView } from './TimeClockView';

interface Props {
  title: string; // SDT | DST | Local
  data?: AirportTimeZoneInformationModel;
  showCurrentTime?: boolean;
  showAirportTime?: boolean;
  timeDeference?: string;
}

export const TimeZoneCardView = ({
  title,
  data,
  showCurrentTime = false,
  showAirportTime = false,
  timeDeference = '',
}: Props) => {
  const classes = useStyles();
  const currentDateTime = moment();

  const offsetDifference = offset => {
    if (showCurrentTime) {
      return `Offset From UTC <strong>${currentDateTime.format('Z')}</strong>`;
    }
    return offset ? `Offset From UTC <strong>${offset}</strong>` : 'No Data Available';
  };

  return (
    <Card variant="outlined" className={classes.cardRoot}>
      <Typography align="center" variant="h6" className={classes.cardTitle}>
        {title}
      </Typography>
      <div className={classes.cardContent}>
        {data && (
          <div className={classes.sdtInformation}>
            <Typography variant="body2" dangerouslySetInnerHTML={{ __html: offsetDifference(data.zoneDiff) }} />
            <ViewPermission hasPermission={Boolean(data.startDate || data.endDate)}>
              <>
                <ViewPermission hasPermission={Boolean(data.startDate)}>
                  <Typography variant="body2">
                    <span>{data.timeType} Starts </span>
                    <strong>
                      {data.startDate} {data.startTime}
                    </strong>
                  </Typography>
                </ViewPermission>
                <ViewPermission hasPermission={Boolean(data.endDate)}>
                  <Typography variant="body2">
                    <span>{data.timeType} Ends </span>
                    <strong>
                      {data.endDate} {data.endTime}
                    </strong>
                  </Typography>
                </ViewPermission>
              </>
            </ViewPermission>
          </div>
        )}
        <ViewPermission hasPermission={showCurrentTime}>
          <TimeClockView timeZoneOffset={currentDateTime.format('Z')} />
        </ViewPermission>
        <ViewPermission hasPermission={showAirportTime && Boolean(data?.zoneDiff)}>
          <TimeClockView timeZoneOffset={data?.zoneDiff || ''} />
        </ViewPermission>
        <ViewPermission hasPermission={Boolean(timeDeference)}>
          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: timeDeference }} />
        </ViewPermission>
      </div>
    </Card>
  );
};

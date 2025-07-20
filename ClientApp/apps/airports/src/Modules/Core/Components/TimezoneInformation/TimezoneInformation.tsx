import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import React, { FC, ReactNode, useState, useEffect } from 'react';
import { airportBasePath, AirportModel, AirportTimezoneModel, updateAirportSidebarOptions } from '../../../Shared';
import { useStyles } from './TimezoneInformation.styles';
import { TimeZoneCardView } from './TimeZoneCardView/TimeZoneCardView';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import { ViewPermission } from '@wings-shared/core';
import { useParams } from 'react-router-dom';
import { inject } from 'mobx-react';

interface Props {
  airport: AirportModel;
  sidebarStore?: typeof SidebarStore;
}

const TimezoneInformation: FC<Props> = ({ airport, sidebarStore }) => {
  const [ timeDifference, setTimeDifference ] = useState('No Data Available');
  const classes = useStyles();
  const params = useParams();
  const timeZone = airport.timezoneInformation;

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Timezone Information', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    if (!timeZone.currentTime?.zoneDiff) {
      return;
    }

    const airportOffsetMinutes = AirportTimezoneModel.getOffsetInMinutes(timeZone.currentTime?.zoneDiff);
    const userLocalOffsetMinutes = AirportTimezoneModel.getOffsetInMinutes(moment().format('Z'));
    const currentTime = moment.utc().add(airportOffsetMinutes, 'minutes');
    const userLocalTime = moment.utc().add(userLocalOffsetMinutes, 'minutes');
    // Calculate the time difference in minutes
    // We are not using hours as moment js ignore .5 value i.e 3:30 it will return only 3
    const timeDifference = currentTime.diff(userLocalTime, 'minutes');

    if (timeDifference === 0) {
      setTimeDifference('No Difference in Time Zones');
      return;
    }
    setTimeDifference(
      `<strong>${Math.abs(timeDifference / 60)}</strong> hour(s) ${
        timeDifference > 0 ? 'ahead' : 'behind'
      } Current Time`
    );
  }, []);

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={airport.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <Grid className={classes.root}>
        <TimeZoneCardView
          title="Airport Time"
          showAirportTime={true}
          data={{ ...timeZone.currentTime, startDate: '', endDate: '', hasStartEndTimeAvailable: false }}
        />
        <TimeZoneCardView title="My Current Time" data={timeZone.local} showCurrentTime={true} />
        <TimeZoneCardView title="Time Difference" timeDeference={timeDifference} />
        <TimeZoneCardView title="STD Time" data={timeZone.sdt} />
        <ViewPermission hasPermission={timeZone.hasDst}>
          <TimeZoneCardView title="DST Time" data={timeZone.dst} />
        </ViewPermission>
      </Grid>
    </DetailsEditorWrapper>
  );
};

export default inject('sidebarStore')(TimezoneInformation);

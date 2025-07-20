import React, { FC, useEffect, useState } from 'react';
import { IClasses } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  withStyles,
} from '@material-ui/core';
import { LocationHoursModel } from '../../Models/LocationHours.model';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { styles } from './OperatingHoursAddData.style';
import { Dialog } from '@uvgo-shared/dialog';
import moment from 'moment';
import { EyeShowIcon } from '@uvgo-shared/icons';
import { SlidesApprovalStore } from 'apps/vendor-management/src/Stores';

const dayNames = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];

interface TimeRange {
  id: string;
  hoursId: number;
  scheduleId: number;
  patternedRecurrenceId: number;
  startTime: string;
  endTime: string;
  is24Hours: boolean;
  isNew?: boolean;
  sequence?: number;
  hoursTypeId?: number;
  statusId?: number;
  accessLevelId?: number;
  startDate?: Date;
  endDate?: Date;
  includeHoliday?: boolean;
  dayOfWeekId?: number;
  patternedRecurrenceDaysofWeekId?: number;
  active?: boolean;
}

interface Props {
  classes?: IClasses;
  slidesApprovalStore: SlidesApprovalStore;
}

const OperatingHoursAddData: FC<Props> = ({ classes,slidesApprovalStore }) => {
  const [ timeData, setTimeData ] = useState<{ [key: string]: TimeRange[] }>({});
  const dayOfWeekIds: { [key: string]: number } = {
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
  };  

  useEffect(() => {
    if (!slidesApprovalStore.onboardingHoursList) return;
    const updatedTimeData: { [key: string]: TimeRange[] } = dayNames.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {} as { [key: string]: TimeRange[] });
    
    slidesApprovalStore.onboardingHoursList?.forEach(item => {
      const { schedule, id: hoursId } = item;
      const { patternedRecurrence } = schedule;
      patternedRecurrence.patternedRecurrenceDaysofWeek.forEach(day => {
        const dayName = day.dayOfWeek.name;
        if (updatedTimeData[dayName]) {
          const startTime = moment(schedule.startTime)
            .utc()
            .format('HH:mm');
          const endTime = moment(schedule.endTime)
            .utc()
            .format('HH:mm');
          updatedTimeData[dayName].push({
            id: `original-${dayName}-${startTime}-${endTime}`,
            startTime,
            endTime,
            is24Hours: Boolean(
              moment(schedule.startTime)
                .utc()
                .format('HH:mm') === '00:01' &&
                moment(schedule.endTime)
                  .utc()
                  .format('HH:mm') === '23:59'
            ),
            hoursId,
            scheduleId: schedule.id,
            patternedRecurrenceId: patternedRecurrence.id,
            isNew: false,
            sequence: item.sequence,
            hoursTypeId: item.hoursType.id,
            statusId: item.status.id,
            accessLevelId: item.accessLevel.id,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            includeHoliday: schedule.includeHoliday,
            dayOfWeekId: dayOfWeekIds[dayName],
            patternedRecurrenceDaysofWeekId: day.id,
            active: true,
          });
        }
      });
    });

    setTimeData(updatedTimeData);
  }, [ slidesApprovalStore.onboardingHoursList ]);

  const viewTable = () => {
    ModalStore.open(
      <Dialog
        title="Operating Hours"
        open={true}
        onClose={() => ModalStore.close()}
        isPreventDrag
        dialogContent={() => {
          return (
            <TableContainer component={Paper} className={classes.tableView}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Time Range</TableCell>
                    <TableCell>Applicable</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(timeData).map(day =>
                    timeData[day].map((timeRange, index) => (
                      <TableRow key={`${day}-${index}`}>
                        <TableCell component="th" scope="row">
                          {index === 0 && day}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {`${timeRange.startTime} - ${timeRange.endTime}`}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {index === 0 && (
                            <Checkbox disabled checked={timeRange.is24Hours} style={{ marginRight: '10px' }} />
                          )}
                          {index === 0 && '24 Hours'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }}
        dialogActions={() => null}
      />
    );
  };

  return (
    <Box className={classes.operatingHoursAddDataWraper}>
      <Box className="hourChips">
        <Box className="addDataWrapper">
          {dayNames.map(
            day =>
              timeData[day]?.length > 0 && (
                <div key={day}>
                  {timeData[day].map(timeRange => (
                    <label className="hoursDataChip" key={timeRange.id}>
                      <span>{`${day}; ${timeRange.startTime} - ${timeRange.endTime} HRS`}</span>
                    </label>
                  ))}
                </div>
              )
          )}
        </Box>
        <Box className="actionIcons">
          {slidesApprovalStore.onboardingHoursList && slidesApprovalStore.onboardingHoursList.length > 0 && (
            <Tooltip title="View">
              <label className="eyeIcon" onClick={viewTable}>
                <EyeShowIcon />
              </label>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default inject('slidesApprovalStore')(withStyles(styles)(observer(OperatingHoursAddData)));

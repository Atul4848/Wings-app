import React, { FC } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { OperatingHoursModel } from './../../Shared/Models/index';
import { emptyLabel } from '@wings-shared/core';

import { styles } from './OperatingHours.styles';

type Props = {
  hours: OperatingHoursModel[];
  palette?: Palette;
};

export const OperatingHours: FC<Props> = ({ hours, palette }) => {
  const classes = styles(palette);
  if (!hours.length) {
    return null;
  }

  return (
    <div className={classes.container}>
      <div className={classes.row}>
        <div>Day</div>
        <div>From</div>
        <div>To</div>
      </div> 
      {hours.map(hour => 
        <div className={classes.row} key={hour.day}>
          <div>{hour.day}</div>
          <div>{hour.timeFrom || emptyLabel}</div>
          <div>{hour.timeTo  || emptyLabel}</div>
        </div> 
      )}
    </div>
  );

};

export default withTheme(OperatingHours);

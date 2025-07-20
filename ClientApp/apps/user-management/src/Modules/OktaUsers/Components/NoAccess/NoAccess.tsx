import { Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { styles } from './NoAccess.styles';
import InfoIcon from '@material-ui/icons/Info';
import { IClasses } from '@wings-shared/core';

type Props = {
  classes: IClasses;
  message: string;
};

const NoAccess = ({ classes, message }: Props) => {
  return (
    <div className={classes.container}>
      <div className={classes.subContainer}>
        <InfoIcon className={classes.icon} />
        <Typography variant="h6" className={classes.content}>
          {message}
        </Typography>
      </div>
    </div>
  );
};

export default withStyles(styles)(NoAccess);

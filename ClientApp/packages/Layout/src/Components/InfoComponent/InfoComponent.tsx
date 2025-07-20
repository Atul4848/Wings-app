import React, { FC } from 'react';
import { FormLabel, withStyles } from '@material-ui/core';
import { styles } from './InfoComponent.styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { IClasses } from '@wings-shared/core';

type Props = {
  classes?: IClasses;
  label: string;
  tooltipText?: string;
};

export const InfoComponent: FC<Props> = ({ classes, label, tooltipText }) => {
  return (
    <div className={classes.customLabel}>
      <FormLabel className={classes.textRoot}>{label}</FormLabel>
      <Tooltip title={tooltipText || ''} disableFocusListener={true} disableTouchListener={true} arrow={true}>
        <InfoOutlinedIcon className={classes.icon} />
      </Tooltip>
    </div>
  );
};

export default withStyles(styles)(InfoComponent);

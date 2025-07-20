import React, { FC } from 'react';
import { Tooltip, withStyles } from '@material-ui/core';
import { styles } from './CustomActionLabel.styles';
import EditIcon from '@material-ui/icons/Edit';
import { IClasses, ViewPermission } from '@wings-shared/core';
import classNames from 'classnames';

interface Props {
  classes?: IClasses;
  label: string;
  tooltip?: string;
  disabled?: boolean;
  onAction: () => void;
  hideIcon?: boolean;
}

const CustomActionLabel: FC<Props> = ({
  tooltip,
  label,
  classes,
  onAction,
  hideIcon = false,
}: Props) => {
  const labelClasses = classNames({
    [classes.root]: true,
    [classes.fullWidth]: !hideIcon,
  });
  return (
    <div className={labelClasses}>
      <span>{label}</span>
      <ViewPermission hasPermission={!hideIcon}>
        <Tooltip title={tooltip || ''}>
          <EditIcon className={classes.icon} onClick={() => onAction()} />
        </Tooltip>
      </ViewPermission>
    </div>
  );
};
export default withStyles(styles)(CustomActionLabel);

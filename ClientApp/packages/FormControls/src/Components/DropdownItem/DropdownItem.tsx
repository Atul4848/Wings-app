import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { styles } from './DropdownItem.styles';
import { MenuItem, withStyles } from '@material-ui/core';
import { IClasses } from '@wings-shared/core';

interface IProps {
  classes?: IClasses;
  isRed?: boolean;
  isSubtitle?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  noPadding?: boolean;
  isDisabled?: boolean;
  isHeaderItem?: boolean;
}

export const DropdownItem: FC<IProps> = (props: IProps) => {
  const { classes, isRed, onClick, isSubtitle, noPadding, isHeaderItem } = props;

  if (isSubtitle) {
    return <div className={classes.subtitle}>{props.children}</div>;
  }

  const itemClasses = classNames({
    [classes.item]: true,
    [classes.red]: isRed,
    [classes.itemNoPadding]: noPadding,
    [classes.headerItem]: isHeaderItem,
  });

  const red = {
    color: '#f20000',
  };

  return (
    <MenuItem
      disabled={props.isDisabled}
      className={itemClasses}
      style={isRed ? red : {}}
      onClick={() => onClick()}
    >
      {props.children}
    </MenuItem>
  );
};

/* istanbul ignore next */
DropdownItem.defaultProps = {
  isRed: false,
  isSubtitle: false,
  onClick: () => {},
};

export default withStyles(styles)(DropdownItem);

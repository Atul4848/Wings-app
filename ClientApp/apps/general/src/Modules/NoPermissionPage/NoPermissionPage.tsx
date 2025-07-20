import React, { FC } from 'react';
import { useStyles } from './NoPermissionPage.styles';
import { observer } from 'mobx-react';
import {
  IClasses,
} from '@wings-shared/core';
import Logo from './noPermission.png';

type Props = {
  classes?: IClasses;
};

const NoPermissionPage: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.headerContainer}>
      <img src={Logo}/>
    </div>
  );
}

export default (observer(NoPermissionPage));

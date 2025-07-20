import React, { FC, ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import { useStyles } from './HealthAuthorizationContentWrapper.styles';
import { IClasses } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  children: ReactNode;
  title: string;
}

const HealthAuthorizationContentWrapper: FC<Props> = ({ children, title }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
      </div>
      <div className={classes.content}>{children}</div>
    </div>
  );
};
export default HealthAuthorizationContentWrapper;

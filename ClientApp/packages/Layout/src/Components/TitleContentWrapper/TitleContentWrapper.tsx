import React, { FC, ReactNode } from 'react';
import { Typography, withStyles } from '@material-ui/core';
import { styles } from './TitleContentWrapper.styles';
import { IClasses } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  children: ReactNode;
  title: string;
  permitTitle: string;
}

const TitleContentWrapper: FC<Props> = ({ classes, children, title, permitTitle }: Props) => {
  return (
    <div className={classes.wrapper}>
      <Typography className={classes.permitTitle} variant="h5">{permitTitle}</Typography>
      <div className={classes.root}>
        {/* <div className={classes.title}>
          <Typography variant="h6">{title}</Typography>
        </div> */}
        <div className={classes.content}>{children}</div>
      </div>
    </div>
  );
};
export default withStyles(styles)(TitleContentWrapper);

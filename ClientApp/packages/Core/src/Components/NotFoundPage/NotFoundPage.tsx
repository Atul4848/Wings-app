import React, { FC, useEffect } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './NotFoundPage.styles';
import { IClasses } from '../../Interfaces';
import { UIStore } from '../../Stores';

type Props = {
  classes?: IClasses;
  fullScreen?: boolean;
};

const NotFoundPage: FC<Props> = ({ classes, fullScreen }) => {
  /* istanbul ignore next */
  useEffect(() => {
    if (fullScreen) {
      UIStore.setforcePageNotFound(true);
    }
  }, [fullScreen]);

  return (
    <div className={classes.root}>
      <div className={classes.title}>404</div>
      <div className={classes.message}>Page you are looking for could not be found</div>
    </div>
  );
};

export default withStyles(styles)(NotFoundPage);

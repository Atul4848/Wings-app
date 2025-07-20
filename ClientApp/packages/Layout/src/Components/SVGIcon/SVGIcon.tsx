import React, { FC } from 'react';
import { styles } from './SVGIcon.styles';
import { withStyles } from '@material-ui/core';
import { IClasses } from '@wings-shared/core';

type Props = {
  name: string;
  classes?: IClasses;
  classNames?: string;
  width?: number;
  height?: number;
};

const SVGIcon: FC<Props> = ({ name, classes, classNames = '', width, height }) => (
  <svg width={width} height={height} className={`${classes.icon} icon--${name} ${classNames}`}>
    <use xlinkHref={`${[ window.location.protocol, window.location.host ].join('//')}/icons-sprite.svg#icon-${name}`} />
  </svg>
);

export default withStyles(styles)(SVGIcon);

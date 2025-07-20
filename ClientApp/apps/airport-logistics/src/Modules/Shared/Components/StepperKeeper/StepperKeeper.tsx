import React, { FC, ReactNode } from 'react';
import { withTheme } from '@material-ui/core';
import { Scrollable } from '@uvgo-shared/scrollable';
import { Palette } from '@material-ui/core/styles/createPalette';

import { styles } from './StepperKeeper.styles';

type Props = {
  children: ReactNode;
  palette?: Palette;
};

const StepperKeeper: FC<Props> = ({ children, palette }) => {
  const classes = styles(palette);
  return <Scrollable className={classes.container}>{children}</Scrollable>;
};

export default withTheme(StepperKeeper);

import { Theme } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { flexRow } from '@wings-shared/core';

export const textFieldStyles = (theme: Theme): CSSProperties => {
  return {
    width: 70,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  };
};

export const textFieldContainerStyles = (theme: Theme): CSSProperties => {
  return {
    ...flexRow(theme),
    alignItems: 'center',
  };
};

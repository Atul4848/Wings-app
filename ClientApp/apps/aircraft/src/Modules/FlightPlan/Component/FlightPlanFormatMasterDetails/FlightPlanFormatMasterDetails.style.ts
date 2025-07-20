import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flex: 1,
  },
  chip: {
    minWidth: 40,
    maxHeight: 20,
    marginRight: spacing(0.5),
    padding: `${spacing(1)}px !important`,
  },
}));

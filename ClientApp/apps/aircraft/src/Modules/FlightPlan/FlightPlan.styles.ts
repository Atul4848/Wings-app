import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const styles = createStyles(({ palette, spacing }: Theme) => ({
  chip: {
    minWidth: 40,
    maxHeight: 20,
    marginRight: spacing(0.5),
    padding: spacing(1),
  },
}));

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  chip: {
    minWidth: 40,
    maxHeight: 20,
    marginRight: spacing(0.5),
    padding: spacing(1),
  },
}));

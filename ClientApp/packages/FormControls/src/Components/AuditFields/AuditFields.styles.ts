import { createStyles, Theme } from '@material-ui/core';

export const styles = ({ spacing }: Theme) =>
  createStyles({
    root: {
      flexWrap: 'wrap',
      display: 'flex',
      paddingTop: spacing(2),
      marginTop: spacing(2),
    },
    inputControl: {
      paddingBottom: spacing(3),
      paddingRight: spacing(3),
    },
  });

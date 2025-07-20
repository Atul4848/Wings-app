import { createStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    flexRow: {
      display: 'flex',
      flex: 1,
      width: '100%',
      overflowY: 'auto',
      flexDirection: 'column',
    },
    flexContainer: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    inputControl: {
      padding: theme.spacing(3),
      flexBasis: '25%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
  });

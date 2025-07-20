import { createStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    approved: {
      fontSize: '1rem',
      color: theme.palette.success.main,
    },
    unApproved: {
      fontSize: '1rem',
      color: theme.palette.warning.main,
    },
    noDataLabel: {
      marginTop: '10px',
      color: theme.palette.info.main,
    },
    addButton: {
      marginTop: 10,
    },
  });

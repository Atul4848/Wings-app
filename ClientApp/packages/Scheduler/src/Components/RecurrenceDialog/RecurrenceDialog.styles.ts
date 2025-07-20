import { makeStyles, Theme, createStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    paperSize: {
      width: '620px',
    },
    root: {
      width: '100%',
    },
    dialogActions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
    },
    actionButton: {
      marginLeft: theme.spacing(1),
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: '620px',
  },
  root: {
    width: '100%',
  },
  dialogActions: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
}));

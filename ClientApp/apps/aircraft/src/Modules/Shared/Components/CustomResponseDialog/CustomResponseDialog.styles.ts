import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  modalWidth: {
    width: '850px',
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
  content: {
    marginTop: theme.spacing(1.5),
  },
}));

export const useStyles = makeStyles((theme: Theme) => ({
  modalWidth: {
    width: '850px',
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
  content: {
    marginTop: theme.spacing(1.5),
  },
}));

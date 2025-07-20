import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  modalWidth: {
    width: '80%',
    height: '80%',
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
}));

export const useStyles = makeStyles((theme: Theme) => ({
  modalWidth: {
    width: '80%',
    height: '80%',
  },
  headerWrapper: {
    margin: 0,
    wordBreak: 'break-all',
  },
}));

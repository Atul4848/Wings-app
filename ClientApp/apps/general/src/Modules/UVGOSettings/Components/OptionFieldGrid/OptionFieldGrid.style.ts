import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  link: {
    color: theme.palette.primary.main,
  },
  container: {
    '& > div:first-child': {
      height: 'calc(100vh - 485px)',
      maxHeight: 'calc(100vh - 485px)',
      minHeight: '210px',
    },
  },
}));

export const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.primary.main,
  },
  container: {
    '& > div:first-child': {
      height: 'calc(100vh - 485px)',
      maxHeight: 'calc(100vh - 485px)',
      minHeight: '210px',
    },
  },
}));
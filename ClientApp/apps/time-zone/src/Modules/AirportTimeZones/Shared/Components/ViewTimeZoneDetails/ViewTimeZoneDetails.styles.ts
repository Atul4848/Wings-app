import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: '70%',
  },
  gridContainer: {
    height: '60vh',
    width: '100%',
    overflow: 'hidden',
  },
  titleWrapper: {
    display: 'flex',
  },
  iconButton: {
    '&.MuiIconButton-root': {
      padding: '2px 12px',
    },
  },
}));


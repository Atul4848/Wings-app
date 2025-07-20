import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: '60%',
    height: '80vh',
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

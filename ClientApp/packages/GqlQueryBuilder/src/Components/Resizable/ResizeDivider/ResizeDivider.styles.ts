import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  dividerRoot: {
    textAlign: 'center',
    position: 'relative',
  },
  dragIcon: {
    position: 'absolute',
    top: '-10px',
    '&:hover': {
      cursor: 'n-resize',
    },
  },
}));

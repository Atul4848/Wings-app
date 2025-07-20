import { makeStyles } from '@material-ui/core';
 
export const useStyles = makeStyles(({ palette }) => ({
  root: {
    padding: '10px 0px',
  },
  activeRoute: {
    fontWeight: 600,
    cursor: 'context-menu',
    '&.MuiLink-root ': {
      textDecoration: 'none',
    },
  },
  nonActiveRoute: {
    cursor: 'pointer',
  },
}));
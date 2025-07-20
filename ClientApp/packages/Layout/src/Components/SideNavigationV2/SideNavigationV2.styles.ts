import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
  {
    sidebarRoot: {
      position: 'relative',
      height: '100%',
      '&>div:first-child': {
        height: '100%',
      },
    },
  },
  { name: 'wings-side-nav-v2' }
);

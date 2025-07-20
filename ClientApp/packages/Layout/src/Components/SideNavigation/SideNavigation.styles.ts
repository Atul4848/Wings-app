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
    boxContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
  },
  { name: 'wings-side-nav' }
);

import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(
  theme => ({
    root: {
      height: 'calc(100% - 72px)',
      width: '100%',
      display: 'flex',
      flexDirection: 'row-reverse',
    },
    leftPanel: {
      height: '100%',
      width: '20%',
      overflow: 'auto',
      paddingBottom: '10px',
    },
    mainContent: {
      height: '100%',
      width: '100%',
      paddingTop: theme.spacing(2),
      background: theme.palette.background.paper,
      display: 'flex',
      flexDirection: 'column',
    },
    queryContainer: {
      width: '100%',
      height: '150px',
      overflow: 'auto',
      padding: '0px 20px',
      marginBottom: '10px',
    },
    gridContainer: {
      padding: '0px 20px',
      flex: 1,
      overflow: 'auto',
    },
    customHeight: {
      height: '80%',
      minHeight: '200px',
    },
  }),
  { name: 'gql-container' }
);

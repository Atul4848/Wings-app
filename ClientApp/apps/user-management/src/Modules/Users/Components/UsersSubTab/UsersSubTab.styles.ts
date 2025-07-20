import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: 18,
    margin: 100,
    display: 'flex',
    justifyContent: 'center',
  },
  userSubTab: {
    paddingBottom: 15,
    '& div.MuiTabPanel-root': {
      padding: 0,
      border: `1px solid ${theme.palette.divider}`,
      borderTop: 0,
    },
  },
  userLogTab: {
    height: 'calc(100vh - 300px)',
    padding:10
  },
  userLogGrid:{
    height: 'calc(100vh - 350px)',
  }
}));

import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme:Theme) => ({
  heading:{
    display: 'flex',
    marginTop: '10px',
    marginBottom: '10px',
  },
  root:{
    flex: '1',
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper
  },
  selectSettingContainer:{
    display: 'flex',
    maxHeight: '80px',
    marginBottom: '20px',
    justifyContent: 'space-between',
  },
  settingWrapper:{
    height: 'calc(100vh - 280px)'
  }
}));

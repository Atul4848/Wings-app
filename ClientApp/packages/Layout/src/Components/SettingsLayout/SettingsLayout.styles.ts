import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.5),
    flexDirection: 'column',
  },
  heading: {
    display: 'flex',
    marginTop: 10,
    marginBottom: 10,
  },
  selectSettingContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2.5),
    maxHeight: theme.spacing(10),
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
  },
  settingWrapper: {
    height: 'calc(100vh - 280px)',
  },
}));

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
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
    settingWrapper: {
      height: 'calc(100vh - 280px)',
    },
    title: {
      fontSize: '18px',
      fontWeight: 600,
    },
  });
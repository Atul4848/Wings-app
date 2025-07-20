import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { flexRow } from '@wings-shared/core';

export const styles = (theme: Theme) =>
  createStyles({
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      padding: 15,
      marginBottom: 5,
      justifyContent: 'space-between',
    },
    subSection: {
      display: 'flex',
      alignItems: 'center',
    },
    titleContainer: {
      ...flexRow(theme),
      alignItems: 'center',
    },
    title: {
      marginLeft: theme.spacing(1),
    },
    tooltip: {
      marginLeft: theme.spacing(0.5),
    },
    buttonContainer: {
      width: '100%',
      ...flexRow(theme),
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    icon: {
      width: 30,
      marginRight: 10,
      fontSize: 30,
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: 15,
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  titleContainer: {
    ...flexRow(theme),
    alignItems: 'center',
  },
  title: {
    marginLeft: theme.spacing(1),
  },
  tooltip: {
    marginLeft: theme.spacing(0.5),
  },
  buttonContainer: {
    width: '100%',
    ...flexRow(theme),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    marginRight: 10,
    fontSize: 30,
  },
}));

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { flexColumn, flexRow } from '@wings-shared/core';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      padding: theme.spacing(1),
      ...flexColumn(theme),
      '& $buttonContainer': {
        marginBottom: theme.spacing(1),
      },
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
  });


export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
    padding: theme.spacing(1),
    ...flexColumn(theme),
    '& $buttonContainer': {
      marginBottom: theme.spacing(1),
    },
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
}));


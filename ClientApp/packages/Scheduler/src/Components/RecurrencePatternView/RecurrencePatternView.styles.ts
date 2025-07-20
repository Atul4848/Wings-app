import { createStyles, Theme ,makeStyles} from '@material-ui/core/styles';
import { flexColumn } from '@wings-shared/core';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      ...flexColumn(theme),
      '& div.MuiTabs-root': {
        marginRight: theme.spacing(3),
        marginBottom: theme.spacing(3),
      },
    },
    flex: { display: 'flex' },
    title: {
      fontSize: 16,
      marginBottom: theme.spacing(0.5),
    },
    recurrenceTypes: {
      paddingTop: theme.spacing(1),
    },
  });

  export const useStyles = makeStyles((theme:Theme) => ({
    root: {
      ...flexColumn(theme),
      '& div.MuiTabs-root': {
        marginRight: theme.spacing(3),
        marginBottom: theme.spacing(3),
      },
    },
    flex: { display: 'flex' },
    title: {
      fontSize: 16,
      marginBottom: theme.spacing(0.5),
    },
    recurrenceTypes: {
      paddingTop: theme.spacing(1),
    },
  }));

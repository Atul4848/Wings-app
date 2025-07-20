import { createStyles, Theme ,makeStyles} from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      overflowY: 'auto',
    },
    flexRow: {
      display: 'flex',
      flexDirection: 'column',
      flexBasis: '100%',
    },
    groupTitle: {
      marginBottom: theme.spacing(0.5),
    },
    dialogActions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
    },
    actionButton: {
      marginLeft: theme.spacing(1),
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowY: 'auto',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'column',
    flexBasis: '100%',
  },
  groupTitle: {
    marginBottom: theme.spacing(0.5),
  },
  dialogActions: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
}));

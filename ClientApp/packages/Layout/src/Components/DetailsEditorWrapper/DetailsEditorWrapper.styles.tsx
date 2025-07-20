import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: { height: '100%', overflow: 'hidden' },
    container: {
      display: 'flex',
      flexDirection: 'column',
      paddingTop: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      marginTop: theme.spacing(1),
      height: 'calc(100% - 50px)',
      overflow: 'hidden',
    },
    breadCrumbContainer:{
      height: 'calc(95% - 50px)',
    },
    headerActions: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    headerActionsEditMode: {
      justifyContent: 'flex-end',
    },
  });

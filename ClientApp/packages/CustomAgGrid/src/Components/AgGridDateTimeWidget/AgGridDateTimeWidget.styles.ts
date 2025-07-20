import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: '20px',
      marginTop: '20px',
      width: '560px',
      paddingRight: '0',
    },
    flexRow: {
      display: 'flex',
    },
    actions: {
      flex: '0 0 auto',
      display: 'flex',
      paddingRight: theme.spacing(3),
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    inputAdornment: {
      paddingRight: theme.spacing(1.5),
      margin: 0,
    },
  });

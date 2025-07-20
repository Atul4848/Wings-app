import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    iconButton: {
      padding: 5,
    },
    customLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
    },
    textRoot: {
      textAlign: 'left',
      fontSize: 12,
      fontWeight: 600,
    },
    helpIcon: {
      marginLeft: '5px',
      fontSize: '1.00rem',
    },
  });

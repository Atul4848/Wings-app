import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      fontSize: '1.2rem',
      position: 'sticky',
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderTop: `1px solid ${theme.palette.grey['400']}`,
      background: theme.palette.background.paper,
      padding: 15,
    },
    pagination: {
      minWidth: 300,
      textAlign: 'center',
      color: theme.palette.grey['400'],
    },
  });

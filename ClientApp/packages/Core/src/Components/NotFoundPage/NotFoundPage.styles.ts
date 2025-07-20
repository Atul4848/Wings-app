import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexDirection: 'column',
      height: ' 100%',
      width: '100%',
      textAlign: 'center',
    },
    title: {
      fontSize: '150px',
      fontWeight: 300,
      margin: '0 0 10px 0',
      color: theme.palette.primary.main,
    },
    message: {
      margin: '0 0 30px 0',
      fontSize: '28px',
      fontWeight: 300,
      opacity: 0.9,
      color: theme.palette.grey['A700'],
    },
  });

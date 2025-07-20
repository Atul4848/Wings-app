import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      height: '100%',
    },
  });

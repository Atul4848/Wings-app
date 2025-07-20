import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      height: '1px',
    },
  });

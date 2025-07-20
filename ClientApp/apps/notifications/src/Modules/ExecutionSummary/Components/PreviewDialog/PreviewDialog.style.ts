import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    paperSize: {
      height: '80%',
      width: '65%',
    },
    root: {
      height: '100%',
      width: '100%',
      border: '1px solid #ccc',
      padding: '10px',
      overflowY: 'scroll',
    },
  });
import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    paperSize: {
      width: '80%',
      height: 600,
    },
    root: {
      display: 'flex',
      width: '100%',
    },
    gridContainer: {
      '& div.ag-cell': {
        alignItems: 'baseline',
      },
    },
  });

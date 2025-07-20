import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      minHeight: 'calc(100% - 110px)',
      overflow: 'auto',
      '@media (max-width: 1380px)': {
        minHeight: 'calc(100% - 130px)',
      },
    },
  });

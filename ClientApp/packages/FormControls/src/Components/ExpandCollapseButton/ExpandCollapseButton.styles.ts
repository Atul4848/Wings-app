import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    iconButton: {
      '&.MuiIconButton-root': {
        padding: '2px 12px',
      },
    },
  });

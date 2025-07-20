import { createStyles, Theme } from '@material-ui/core/styles';

export const getTooltipStyles = (theme: Theme) =>
  createStyles({
    arrow: {
      color: theme.palette.error.light,
    },
    tooltip: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.common.white,
      maxWidth: 'unset',
      width: 'auto',
    },
  });

import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginRight: theme.spacing(0.5),
    },
    enabled: {
      color: '#65A61B',
      backgroundColor: 'transparent'
    },
    disabled: {
      color: theme.palette.grey.A700,
      backgroundColor: 'transparent'
    },
  });

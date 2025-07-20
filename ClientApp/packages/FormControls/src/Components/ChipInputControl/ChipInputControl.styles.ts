import { Theme, createStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    textRoot: {
      '& [class*="MuiFormLabel-root"]': {
        fontSize: '12px',
        fontWeight: 400,
        '& [class*="MuiFormLabel-asterisk"]': {
          color: 'red',
          fontWeight: 600,
        },
      },
    },
    inActiveText: {
      color: theme.palette.error.main,
    },
  });

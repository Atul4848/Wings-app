import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      '& div[class*=MuiFormControl-fullWidth]': {
        height: '100%',
      },
    },
    inputRoot: {
      '&&[class*="MuiOutlinedInput-root"]': {
        height: '100%',
      },
    },
    inActiveText: {
      color: theme.palette.error.main,
    },
    disabledOption: {
      pointerEvents: 'auto',
    },
  });

import { createStyles, Theme } from '@material-ui/core/styles';

export const getTextFieldStyles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      '& [class*="MuiOutlinedInput-root"]': {
        height: '100%',
        '& [class*="MuiOutlinedInput-input"]': {
          height: '100%',
        },
      },
    },
  });

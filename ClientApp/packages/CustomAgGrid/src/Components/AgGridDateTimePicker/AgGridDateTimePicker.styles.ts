import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      '& [class*="MuiFormControl-root"]': {
        height: '100%',
        '& [class*="MuiOutlinedInput-root"]': {
          height: '100%',
        },
      },
    },
  });

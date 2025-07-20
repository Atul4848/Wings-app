import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    menuItem: {
      minHeight: 30,
    },
    selectInputRoot: {
      minWidth: 80,
      height: '100%',
      '& div': {
        height: '100%',
      },
      '& .MuiSelect-selectMenu': {
        paddingTop: 8,
      },
    },
  });

import { Theme, createStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    formControl: {
      minWidth: 120,
      '& svg': {
        color: theme.palette.grey[600],
      },
    },
    textRoot: {
      minHeight: 40,
      borderRadius: 6,
      fontSize: 14,
    },
    closeButton: {
      '&:hover': {
        cursor: 'pointer',
        '& svg': {
          color: theme.palette.primary.main,
        },
      },
    },
  });

import { makeStyles, Theme } from '@material-ui/core';
import { ChipControlStyles } from '@wings/shared';

export const useStyles = makeStyles((theme: Theme) => ({
  ...ChipControlStyles(theme),
  flexRow: {
    display: 'flex',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  deleteBtn: {
    marginTop: theme.spacing(3.4),
  },
  inputControl: {
    paddingBottom: theme.spacing(3),
  },
  inputFlex: {
    flexBasis: '33.3%',
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: 40,
    maxHeight: 20,
    padding: theme.spacing(1),
    marginRight: theme.spacing(0.5),
    '& .MuiChip-deleteIcon': {
      height: '15px',
      width: '15px',
    },
  },
  buttonContainer: {
    justifyContent: 'start',
  },
}));

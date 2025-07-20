import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: 40,
    marginRight: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

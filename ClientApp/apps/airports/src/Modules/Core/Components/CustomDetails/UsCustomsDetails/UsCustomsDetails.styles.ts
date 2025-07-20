import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  containerClass: {
    paddingTop: '23px',
  },
  buttonStyle: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
}));

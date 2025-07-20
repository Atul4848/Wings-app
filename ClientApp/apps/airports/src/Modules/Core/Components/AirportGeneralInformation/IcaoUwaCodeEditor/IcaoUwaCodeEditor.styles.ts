import { createStyles, makeStyles } from '@material-ui/core/styles';

export const styles = ({ spacing }) =>
  createStyles({
    flexRow: {
      paddingRight: 0,
    },
  });

export const useStyles = makeStyles(() => ({
  flexRow: {
    paddingRight: 0,
  },
}));

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    paperSize: {
      width: '80%',
      height: 600,
    },
  });

export const useStyles = makeStyles(({ spacing, palette }) => ({
  paperSize: {
    width: '80%',
    height: 600,
  },
}));

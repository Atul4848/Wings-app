import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing, palette }: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    flexRow: {
      paddingBottom: spacing(0.5),
      flexBasis: '20%',
    },
    addHours: {
      flex: 'auto',
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'flex-end',
      height: 52,
    },
  });

export const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  flexRow: {
    paddingBottom: spacing(0.5),
    flexBasis: '20%',
  },
  addHours: {
    flex: 'auto',
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'flex-end',
    height: 52,
  },
}));

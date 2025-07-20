import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing, palette }: Theme) =>
  createStyles({
    root: {
      height: '100%',
      paddingTop: spacing(1),
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: spacing(2),
      height: 'calc(100% - 50px)',
      overflow: 'hidden',
    },
    backButton: {
      paddingBottom: spacing(2),
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    headerDetails: {
      display: 'flex',
      alignItems: 'center',
    },
    flexRow: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    placeHolder: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      color: palette.primary.main,
    },
    gridContainer: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    hoursGrid: {
      flexGrow: 1,
    },
  });

export const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    height: '100%',
    paddingTop: spacing(1),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing(2),
    height: 'calc(100% - 50px)',
    overflow: 'hidden',
  },
  backButton: {
    paddingBottom: spacing(2),
  },
  headerTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerDetails: {
    display: 'flex',
    alignItems: 'center',
  },
  flexRow: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  placeHolder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    color: palette.primary.main,
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  hoursGrid: {
    flexGrow: 1,
  },
}));

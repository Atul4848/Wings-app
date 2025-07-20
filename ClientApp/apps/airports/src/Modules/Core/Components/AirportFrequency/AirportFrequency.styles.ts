import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

export const styles = ({ spacing }: Theme) =>
  createStyles({
    buttonContainer: {
      display: 'flex',
      justifyContent: 'end',
      marginBottom: spacing(1),
    },
    gridWrapper: {
      height: '100%',
    },
  });

export const useStylesV2 = makeStyles((theme: Theme) => ({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: theme.spacing(1),
  },
  gridWrapper: {
    height: '100%',
  },
}));

export const useStyles = makeStyles({
  root: {
    height: '100%',
  },
  masterDetails: {
    '& div': {
      maxHeight: 'none',
      padding: 0,
    },
  },
  customHeight: {
    height: '70%',
  },
});

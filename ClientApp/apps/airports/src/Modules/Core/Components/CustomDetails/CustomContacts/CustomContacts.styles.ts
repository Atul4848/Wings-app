import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: spacing(1),
  },
  gridWrapper: {
    height: '100%',
  },
}));

import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  containerClass: {
    paddingTop: spacing(2.5),
  },
}));

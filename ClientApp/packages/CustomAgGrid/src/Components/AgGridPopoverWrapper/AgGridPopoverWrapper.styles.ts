import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 5,
    cursor: 'pointer',
  },
  errorBorder: {
    border: '1px solid red',
  },
}));

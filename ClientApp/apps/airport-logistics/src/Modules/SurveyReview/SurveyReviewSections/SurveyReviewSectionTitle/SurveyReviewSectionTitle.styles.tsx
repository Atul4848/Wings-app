import { makeStyles, darken } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  title: {
    color: darken(palette.grey[300], .2),
    fontSize: '1rem',
  },
  subTitle: {
    color: darken(palette.grey[300], .2),
    fontSize: '.9rem',
  },
}));

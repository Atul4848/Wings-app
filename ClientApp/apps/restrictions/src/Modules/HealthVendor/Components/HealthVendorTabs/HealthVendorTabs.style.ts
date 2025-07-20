import {  makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(({ spacing }) => ({
  title: {
    paddingTop: spacing(0.5),
    paddingBottom: spacing(1),
    fontWeight: 600,
    fontSize: spacing(2),
  },
  wrapper:{
    paddingLeft:'20px'
  },
}));

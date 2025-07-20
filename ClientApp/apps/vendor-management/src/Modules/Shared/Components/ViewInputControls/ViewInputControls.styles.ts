import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme:Theme) => ({
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
    overflow: 'auto',
  },
  title:{
    paddingBottom: theme.spacing(3),
    fontWeight: 600
  },
  inputControl: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '25%',
  },
}));
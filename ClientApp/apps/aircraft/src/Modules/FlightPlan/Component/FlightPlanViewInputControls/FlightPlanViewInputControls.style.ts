import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) =>({
  root: {
    flex: 1,
  },
  button: {
    right: 16,
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  halfFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '100%',
  },
  fullFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '100%',
  },
  inputControl: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  labelRoot: {
    width: '33%',
    paddingRight: 14,
    minWidth: 120,
  },
}))

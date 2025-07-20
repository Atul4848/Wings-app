import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  checkboxRoot: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

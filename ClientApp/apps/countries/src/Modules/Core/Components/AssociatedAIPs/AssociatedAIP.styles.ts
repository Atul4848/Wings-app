import { makeStyles } from '@material-ui/core/styles';

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

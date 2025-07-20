import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
  gridRoot: {
    marginTop: '10px',
    marginBottom: '20px',
    '& > div': {
      minHeight: '300px',
      padding: 0,
    },
  },
}));

import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: 'calc(100vh - 160px)',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

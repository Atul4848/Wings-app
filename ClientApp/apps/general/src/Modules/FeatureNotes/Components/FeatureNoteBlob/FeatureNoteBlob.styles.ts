import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    mainroot: {
      display: 'flex',
      height: '100%',
      width: '100%',
    },
    mainContent: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  });
export const useStyles = makeStyles((theme: Theme) => ({
  mainroot: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

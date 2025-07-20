import { createStyles, makeStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    root: { width: '100%' },
    flex: { display: 'flex' },
  });

 export const useStyles = makeStyles(() => ({
  root: { width: '100%' },
  flex: { display: 'flex' },
  }));

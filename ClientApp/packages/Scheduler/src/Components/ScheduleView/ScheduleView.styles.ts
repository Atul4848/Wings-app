import { createStyles, makeStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    flexRow: { display: 'flex' },
  });
  
export const useStyles = makeStyles(() => ({
  flexRow: { display: 'flex' },
}));

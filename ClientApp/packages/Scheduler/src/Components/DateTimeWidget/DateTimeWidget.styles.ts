import { createStyles,makeStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    flexRow: { display: 'flex' },
  });

 export const useStyles = makeStyles(() => ({
  root: { width: '100%'},
  flexRow: { display: 'flex' },
  }));

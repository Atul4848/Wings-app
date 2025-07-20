import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
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
    },
    warningText: {
      color: 'orange',
    },
    errorText: {
      color: 'red',
    },
  });

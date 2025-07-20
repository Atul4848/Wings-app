import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    root: {
      height: '95%',
    },
    gridContainer: {
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
    userCard: {
      display: 'flex',
      marginBottom: 10,
    },
    btnContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
    },
    marginRight: {
      marginRight: '5px',
    },
  });


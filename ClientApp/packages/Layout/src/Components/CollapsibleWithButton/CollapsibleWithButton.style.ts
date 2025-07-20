import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    collapsibleContainer: {
      position: 'relative',
    },
    buttonContainer: {
      display: ' flex',
      gap: '2px',
      justifyContent:'flex-end',
      position: 'absolute',
      zIndex: 1,
      right: '15px',
      top: '20px',
    },
    button: {
      zIndex: 1,
      marginLeft: 'auto',
      top: '15px',
      display: ' flex',
      right: 16,
      position: 'absolute',
    },
  });

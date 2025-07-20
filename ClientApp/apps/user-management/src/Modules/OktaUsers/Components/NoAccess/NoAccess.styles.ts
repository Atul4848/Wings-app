import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    subContainer: {
      position: 'absolute',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    icon: {
      display: 'flex',
      justifyContent: 'center',
      fontSize: '100px',
      width: '100%',
    },
    content: {
      display: 'flex',
      justifyContent: 'center',
    },
  });

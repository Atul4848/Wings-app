import { createStyles } from '@material-ui/core/styles';

export const styles = () =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      maxWidth: '100%',
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    titleContainer: {
      display: 'flex',
      overflow: 'hidden',
      paddingRight: '5px',
    },
    contentContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      flexShrink: 0,
    },
    title: {
      marginLeft: '10px',
      fontSize:'18px',
    },
    textEllipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: 600,
      fontSize:'18px',
    },
    activateButton: {
      marginRight: '10px',
    },
  });

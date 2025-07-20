import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    btnContainer: {
      display: 'flex',
      width: '100%',
      marginTop: '15px',
      justifyContent: 'flex-end',
      paddingRight: '2px',
    },
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
      '& textarea': {
        height: 'calc(100vh - 285px)',
      },
    },
    paperSize: {
      height: '80%',
      width: '65%',
    },
    root: {
      height: '100%',
      width: '100%',
      border: '1px solid #ccc',
      padding: '10px',
      overflowY: 'scroll',
    },
  });

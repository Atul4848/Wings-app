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
    containerMain: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '455px',
    },
    backBtn: {
      marginTop: '15px',
      '& > div:first-child': {
        paddingLeft: '0',
      },
    },
  });


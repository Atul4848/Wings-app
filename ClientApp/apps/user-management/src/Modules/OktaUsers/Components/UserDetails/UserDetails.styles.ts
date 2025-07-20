import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    modalDetail: {
      display: 'flex',
      paddingBottom: '20px',
      alignContent: 'center',
      flexWrap: 'wrap',
      width: '100%',
      '& label': {
        fontWeight: 600,
      },
    },
    close: {
      minWidth: 30,
      padding: '1px 5px',
      marginLeft: '5px',
    },
    modalRoot: {
      '& div.MuiPaper-root': {
        flexBasis: '50%',
      },
      '& h3':{
        fontWeight: 600,
        fontSize: '1.5rem',
      },
    },
    customLoader: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20%',
    },
    serviceNProductWrapper: {
      display: 'flex',
      flexDirection: 'column',
    },
    serviceNProduct: {
      display: 'flex',
    },
  });

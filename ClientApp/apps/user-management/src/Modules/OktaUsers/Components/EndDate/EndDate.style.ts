import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    modalDetail: {
      display: 'flex',
      paddingBottom: '20px',      
      alignContent: 'center',
      justifyContent: 'space-around',
    },
    modalHeading: {
      paddingBottom: '5px',
    },
    close: {
      minWidth: 30,
      padding: '1px 5px',
      marginLeft: '5px',
    },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: palette.background.default,
        width: '630px',
      },
    },
    customLoader: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20%',
    },
  });

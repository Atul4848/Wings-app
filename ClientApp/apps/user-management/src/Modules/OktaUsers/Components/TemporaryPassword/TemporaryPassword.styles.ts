import { createStyles, Theme } from '@material-ui/core/styles';
export const styles = ({ palette }: Theme) =>
  createStyles({
    passwordText: {
      display: 'flex',
      justifyContent: 'space-between',
      border: '1px solid #C7C8CA',
      height: 40,
      alignItems: 'center',
      paddingLeft: '7px',
      margin: '0px 0 5px',
      borderRadius: '6px',
    },
    modalRoot: {
      '& div.MuiPaper-root': {
        width: 510,
        padding: 20,
      },
    },
    statusText: {
      marginBottom: 40,
      marginTop: 20,
      textAlign: 'center',
    },
    inputControl: {
      paddingBottom: 0,
      '& p.MuiTypography-root': {
        padding: '0',
      },
    },
    copyBtn: {
      borderRadius: 0,
      minWidth: '40px',
      padding: '0',
      display: 'flex',
      justifyContent: 'end',
      color: '#1976D2',
    },
    infoText: {
      fontSize: 14,
      color: palette.grey.A700,
    },
    headerWrapper: {
      '& h3':{
        fontWeight: 600,
        textAlign: 'center',
        display: 'block',
        color: palette.grey.A700,
      },
      '& div':{
        display: 'none',
      },
    },
    inputLabel:{
      color: palette.grey.A700,
      fontSize: 12,
      fontWeight: 600,
    },
    checkIcon:{
      '& div':{
        color: '#65A61B',
        width: 55,
        height: 55,
        margin: '0 auto',
      }
    },
    btnPosition: {
      '& button': {
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'capitalize',
        color: palette.background.paper,
        marginTop: 40,
        width: '100%',
        backgroundColor: '#1976D2',
        height: 40,
        padding: '4px 20px',
        '&:hover': {
          backgroundColor: '#63A4FF',
        },
      },
    },
  });

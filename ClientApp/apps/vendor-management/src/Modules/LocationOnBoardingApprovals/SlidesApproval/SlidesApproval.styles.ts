import { Container, createStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  headerActions: {
    justifyContent: 'space-between',
    borderBottom: '1px solid #D3D3D3',
    paddingBottom: '16px',
    '& button': {
      width: '150px',
      marginRight: theme.spacing(1),
    },
    '& h5': {
      fontSize: '1.625rem',
    },
    '& h6': {
      fontSize: '18px',
    },
  },
  subHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    alignItems: 'flex-start',
    '& .MuiIconButton-label': {
      color: '#1976D2',
    },
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '26px',
    fontWeight: 400,
  },
  headerNumbers: {
    fontSize: '14px',
    fontWeight: 510,
  },
  container: {
    height: 'calc(100% - 50px)',
    display: 'flex',
    overflow: 'hidden',
    paddingLeft: '0px !important',
    paddingTop: '0px',
    paddingRight: '16px',
    flexDirection: 'column',
  },
  outerBox: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  innerBox1: {
    paddingTop: '16px',
  },
  innerBox2: {
    flexGrow: 0,
    paddingBottom: '30px',
  },
  thirdBox: {
    position: 'sticky',
    bottom: '-10px',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    paddingBottom: '40px',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  innerBox3: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    width: '100%',
    gap: '10px',
  },
  rejectionBox: {
    height: '40px',
    padding: '4px 14px 4px 10px',
    border: '1px solid #DB063B',
    borderRadius: '4px',
    backgroundColor: '#DB063B0D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
    marginBottom: '10px',
  },
  rejectionMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  rejectionText: {
    color: '#202020',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '28px',
  },
  dismissButton: {
    '& button': {
      color: '#1976D2',
      padding: '4px 10px',
      height: '40px',
      borderRadius: '4px',
      fontSize: '14px',
      textTransform: 'none',
      '& span': {
        fontWeight: '700',
      },
    },
  },
  defaultButton: {
    '& button': {
      padding: '4px 10px',
      height: '40px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '400',
      minWidth: '22.5rem',
      textTransform: 'none',
    },
  },
  button: {
    marginLeft: '16px',
    '& button': {
      padding: '0px',
      height: '40px',
      fontSize: '14px',
      fontWeight: '400',
      width: '100px',
      textTransform: 'capitalize',
      color: '#1976D2',
    },
  },
  rejectButton: {
    '& button': {
      padding: '4px 10px',
      height: '40px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '400',
      minWidth: '22.5rem',
      textTransform: 'none',
      color: '#d32f2f !important',
      border: '1px solid #d32f2f  !important',
    },
    '&:hover': {
      backgroundColor: '#fddddd',
      borderColor: '#d32f2f',
      color: '#d32f2f !important',
    },
  },
  box: {
    padding: '30px 40px 30px 40px',
  },
  dialogTitle: {
    fontSize: '18px',
    fontWeight: '600',
  },
  buttonBox: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  primaryButton: {
    '& button': {
      background: '#1976D2',
      color: '#fff',
      minWidth: '100px',
      height: '40px',
    },
    '& button:disabled': {
      background: '#afafaf',
      border: 'none',
      color: 'white',
    },
  },
}));

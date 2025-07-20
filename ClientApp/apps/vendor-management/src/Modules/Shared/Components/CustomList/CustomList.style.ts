import { createStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    [theme.breakpoints.down('sm')]: {
      customListWrapper: {
        overflowX: 'auto',
        padding: '6px',
      },
    },
    card: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
      boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '0px 10px 0px 10px',
      alignItems: 'center',
      color: '#202020',
      borderRadius: '4px',
      [theme.breakpoints.down('sm')]: {
        minWidth: '700px',
      },
      '& .userIcon .MuiSvgIcon-root':{
        width:'30px !important',
        height:'30px !important'
      },
      '& .MuiSvgIcon-root':{
        width: '20px !important',
        height: '20px !important'
      },
      '& .descriptionIcon .MuiSvgIcon-root':{
        width:'12px !important',
        height:'12px !important'
      },
    },
    table: {
      width: '100%',
      textAlign: 'center',
      alignItems: 'center',
    },
    firstColumn: {
      width: '50%',
    },
    fixedHeader: {
      marginBottom: theme.spacing(1),
      paddingTop: '10px',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        minWidth: '700px',
      },
    },
    firstColumnData: {
      display: 'flex',
      alignItems: 'center',
    },
    secondColumnData: {
      display: 'flex',
      alignItems: 'center',
    },
    phoneNumber: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100px',
    },
    locationSelected: {
      border: '2px solid rgb(0,75,160)!important',
    },
    gridActionsWrapper: {
      textAlign: 'end',
      '& .MuiButton-text:hover':{
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '4px',
        padding: '12px',
      },
      '& .MuiButton-contained:hover':{
        backgroundColor: '#63A4FF !important'
      },
      '& button': {
        minWidth: 'auto',
        margin: '0',
        padding: '12px',
        [theme.breakpoints.down('sm')]: {
          padding: '5px',
        },
      },
      '&.vendorAddressPage': {
        '& button': {
          margin: '0 0px',
        },
      },
    },
    spaceing:{
      width: 'calc(100% + 50px)',
      margin: '-12px'   
    },
    helpIcon:{
      color: '#1976D2',
      cursor: 'pointer',
      fontSize: '16px',
      marginLeft:'5px'
    }
  });
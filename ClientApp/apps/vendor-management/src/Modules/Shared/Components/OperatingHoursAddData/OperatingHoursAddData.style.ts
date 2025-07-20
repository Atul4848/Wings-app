import { createStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  operatingHoursAddDataWraper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    justifyContent: 'space-between',
    '& .hourChips':{
      display: 'flex',
      maxWidth: '98%',
      alignItems: 'center',
    },
    '& .addDataWrapper': {
      display: 'flex',
      justifyContent: 'flex-start',
      overflowX: 'scroll',
      scrollbarWidth: 'none',
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(0.5),
      minHeight: '42px',
      marginRight: '10px'
    },
    '& .hoursDataChip': {
      backgroundColor: '#F1F1F1',
      color: '#202020',
      display: 'flex',
      borderRadius: '4px',
      padding: '4px 7px',
      marginBottom: '5px',
      marginRight: theme.spacing(1),
      alignItems: 'center',
      '& span': {
        marginLeft: theme.spacing(0.5),
        fontSize: '14px',
        fontWeight: 400,
      },
      height: '30px',
      textWrap: 'nowrap',
      width: 'fit-content'
    },
    '& .actionIcons': {
      borderLeft: '1px solid #D3D3D3',
      color: '#7C7C7C',
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
      marginLeft: 'auto',
      margin: '15px'
    },
    '& .eyeIcon': {
      paddingRight: theme.spacing(0.5),
      color: '#1976D2',
      cursor: 'pointer',
    },
  },
  dialogMainContainer: {
    border: '1px solid red',
    '& .MuiDialog-paperWidthSm': {
      minWidth: '650px',
    },
  },
  dialogContainerWidth: {
    width: '100%',
    overflow: 'hidden',
  },
  defaultButton: {
    '& button': {
      border: '1px solid #1976D2',
      padding: '4px 10px 4px 10px',
      height: '40px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '400',
      width: '98%',
      textTransform: 'capitalize',
      color: '#1976D2',
    },
  },
  tableView:{
    '& .MuiTableCell-head':{
      fontSize: '14px'
    },
    '& .MuiTableCell-root':{
      fontSize: '14px'
    }
  }
}));

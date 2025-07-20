import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  customHeight: {
    height: 'calc(100vh - 200px)',
  },
  dialogTitle:{
    display: 'flex',
    justifyContent: 'space-between'
  },
  dangerButton:{
    backgroundColor:'#D81B60',
    border:'1px solid #D81B60',
    height:'auto',
    minHeight:'30px',
    paddingTop:'3px',
    paddingBottom:'3px',
    '& span':{
      whiteSpace: 'inherit'
    }
  }
});

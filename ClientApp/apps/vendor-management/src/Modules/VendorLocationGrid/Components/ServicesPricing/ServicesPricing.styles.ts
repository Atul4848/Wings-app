import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  headerActions: {
    justifyContent: 'space-between',
    '& button':{
      backgroundColor:'#005295!important',
      color:'#ffffff',
      '&:hover':{
        backgroundColor:'#003968!important'
      }
    },
    '& .MuiTypography-h6':{
      width: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordWrap: 'normal',
      whiteSpace: 'nowrap'
    },
    '& .inner-header button':{
      backgroundColor:'inherit!important',
      color:'#1976d2',
      '&:hover':{
        border: '1px solid #1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.04)!important'
      }
    }
  },
  customHeight: {
    height: 'calc(100vh - 280px)',
  },
  gridHeight:{
    paddingBottom:'70px'
  },
  headerCustomButtons:{
    textAlign:'right',
    marginBottom:'10px',
    '& a, & button':{
      marginLeft:'10px'
    } 
  },
});

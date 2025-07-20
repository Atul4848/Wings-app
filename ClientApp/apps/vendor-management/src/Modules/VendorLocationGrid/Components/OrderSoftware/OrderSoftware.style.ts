import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles({
  editorWrapperContainer: {
    height:'calc(100vh - 180px)',
    '& .MuiCollapse-entered':{
      paddingBottom:'50px'
    }
  },
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
    }
  }
});
import { createStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    root:{
      '& .MuiCollapse-root':{
        paddingBottom:'20px'
      },
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
    },
    customHeight: {
      height: 'calc(100vh - 220px)'
    },
    editorWrapperContainer: {
      overflow: 'auto'
    },
    disabledGrid:{
      pointerEvents:'none',
      opacity: '0.6'
    }
  });
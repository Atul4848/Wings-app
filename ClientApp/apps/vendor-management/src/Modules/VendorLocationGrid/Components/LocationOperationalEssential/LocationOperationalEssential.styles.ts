import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme:Theme) => ({
  root:{
    flex: '1',
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper
  },
  editorWrapperContainer: {
    overflow: 'auto'
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
}));
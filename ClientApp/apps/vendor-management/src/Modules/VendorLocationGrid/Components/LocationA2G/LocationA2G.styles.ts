import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1',
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  editorWrapperContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    '& .MuiFormLabel-root':{
      fontWeight: 600
    },
    '& .ql-container':{
      width: '100%',
      display: 'grid'
    },
    '& .ql-editor':{
      width: '100%'
    },
    '& .flexWrap':{
      overflow: 'visible'
    },
    '& .makeStyles-root-93':{
      padding: theme.spacing(0),
      paddingBottom: theme.spacing(5)
    }
  },
  headerActions: {
    justifyContent: 'space-between',
    '& button': {
      backgroundColor: '#005295!important',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#003968!important',
      },
    },
    '& .MuiTypography-h6':{
      width: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordWrap: 'normal',
      whiteSpace: 'nowrap'
    }
  },
  buttonStyle: {
    height: '25px',
    color: 'black',
    cursor: 'pointer',
  },
  customHeight: {
    height: 'calc(100vh - 400px)',
  },
  imageIcon: {
    height: '15px',
    width: '15px',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    pointerEvents: 'all',
    float: 'right',
  },
  pdfIcon:{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
  }
}));

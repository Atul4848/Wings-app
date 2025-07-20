import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  dialog:{
    padding: '20px',
    textAlign: 'center',
    paddingRight:'10px',
    '& .hoursDataContent':{
      maxHeight: '385px',
      overflowY: 'auto',
      paddingRight:'20px'
    }
  },
  titleWrapper:{
    display:'flex',
    justifyContent: 'space-between',
    marginBottom:'20px'
  },
  title: {
    fontFamily: 'Open Sans',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '27px',
    letterSpacing: '0em',
    textAlign: 'center',
    padding: '0px',
    '& h2':{
      fontSize:'14px'
    }
  },
  content: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '19px',
    letterSpacing: '0em',
    textAlign: 'center',
    padding:'0'
  },
  button: {
    marginLeft:'10px',
    '& button':{
      padding:'4px 10px',
      height: '40px',
      fontSize:'14px',
      fontWeight: '400',
      width:'140px',
      textTransform:'capitalize',
      color:'#1976D2',
    }
  },
  primaryButton:{
    '& button':{
      background: '#1976D2',
      color:'#fff'
    },
    '& button:disabled':{
      background: '#afafaf',
      border:'none'
    },
    '& button:hover':{
      backgroundColor: '#63A4FF'
    }
  },
});

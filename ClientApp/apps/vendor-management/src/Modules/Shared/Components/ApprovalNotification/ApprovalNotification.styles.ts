import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
  notificationPanel:{
    border: '1px solid rgb(209, 97, 36)',
    backgroundColor: 'rgba(209, 97, 36, 0.15)',
    gap: '10px',
    width: '100%',
    display: 'flex',
    padding: '4px 14px 4px 10px',
    alignItems: 'center',
    borderRadius: '4px',
    justifyContent: 'space-between',
    marginBottom:'10px',
    '& .clickHereButton':{
      textTransform:'capitalize',
      paddingTop:'3px',
      paddingBottom:'3px'
    }
  }
}));

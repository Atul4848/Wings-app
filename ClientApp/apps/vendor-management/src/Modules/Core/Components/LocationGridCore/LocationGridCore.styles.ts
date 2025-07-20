import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  customHeight: {
    height: 'calc(100vh - 150px)',
  },
  gridHeaderWapper:{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
  }
});

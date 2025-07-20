import { Theme, createStyles, makeStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    customHeight: {
      height: 'calc(100vh - 200px)',
    },
    icons:{
      width: '20px',
      height: '20px'
    },
  });

import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  customHeight: {
    height: 'calc(100vh - 200px)',
  },
  actionButton: {
    paddingTop: '10px',
  },
  icons: {
    width: '20px',
    height: '20px',
  },
  titleContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  contentContainer: {
    flexShrink: 0,
  },
});

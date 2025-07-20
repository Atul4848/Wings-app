import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  customHeight: {
    height: 'calc(100vh - 300px)',
  },
  title: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  titleContainer: {
    width: '100%',
  },
  contentContainer: {
    flexShrink: 0,
  },
});

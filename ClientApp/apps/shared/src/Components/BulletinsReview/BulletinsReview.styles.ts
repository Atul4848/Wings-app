import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  title: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  titleContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  contentContainer: {
    flexShrink: 0,
  },
  customHeight: {
    height: 'calc(100vh - 200px)',
  },
  icons: {
    width: '20px',
    height: '20px',
  },
  boldSubtitle: {
    fontWeight: 600,
  },
  actionButton: {
    paddingTop: '10px',
  },
});

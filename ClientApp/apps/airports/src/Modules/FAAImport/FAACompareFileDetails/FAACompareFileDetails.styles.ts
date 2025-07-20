import { createStyles, Theme, makeStyles } from '@material-ui/core';
export const styles = (theme: Theme) =>
  createStyles({
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
  });

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
});

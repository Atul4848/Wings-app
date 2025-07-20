import { createStyles, makeStyles, Theme } from '@material-ui/core';
export const styles = (theme: Theme) =>
  createStyles({
    editorWrapperContainer: {
      overflow: 'auto',
    },
    headerActionsEditMode: {
      justifyContent: 'space-between',
    },
    inactiveReason: {
      flexBasis: '66.6%',
    },
    mapButton: {
      marginRight: '10px',
    },
  });

export const useStyles = makeStyles({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  inactiveReason: {
    flexBasis: '66.6%',
  },
  mapButton: {
    marginRight: '10px',
  },
});

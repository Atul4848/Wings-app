import { createStyles, makeStyles, Theme } from '@material-ui/core';
export const styles = (theme: Theme) =>
  createStyles({
    editorWrapperContainer: {
      overflow: 'auto',
    },
    headerActionsEditMode: {
      justifyContent: 'space-between',
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
}));

import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1',
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  gridRoot: {
    marginTop: '10px',
    marginBottom: '20px',
    '& > div': {
      minHeight: '300px',
      padding: 0,
    },
  },
}));

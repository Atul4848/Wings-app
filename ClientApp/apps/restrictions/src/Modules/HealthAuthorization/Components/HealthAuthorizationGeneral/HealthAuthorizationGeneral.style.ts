import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  contentRoot: {
    height: 'calc(100% - 50px) !important',
  },
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    flexDirection: 'column',
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  contentWrapper: {
    overflowY: 'auto',
    height: 'calc(100vh - 300px)',
  },
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
}));

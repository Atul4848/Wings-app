import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  expandContentWrapper: {
    overflowY: 'auto',
    height: 'calc(100vh - 280px)',
  },
  generalRequirementWrapper: {
    overflowY: 'auto',
    height: 'calc(100vh - 280px)',
    padding: '0px 24px',
  },
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
}));

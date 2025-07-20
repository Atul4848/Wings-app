import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  containerClass: {
    paddingTop: theme.spacing(2.5),
  },
  securityNotes: {
    flexBasis: '100%',
  },
}));

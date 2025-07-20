import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  tabPanel: {
    overflowY: 'auto',
    height: 'calc(100vh - 335px)',
  },
  containerClass: {
    paddingTop: '23px',
  },
  editorWrapperContainer: {
    overflowY: 'auto',
  },
}));

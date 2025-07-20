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
    paddingTop: theme.spacing(2.5),
  },
  editorWrapperContainer: {
    overflowY: 'auto',
  },
  gridRoot:{
    marginTop:'10px',
    marginBottom: '20px',
    '& > div':{
      minHeight: '300px',
      padding: 0,
    },
  },
}));

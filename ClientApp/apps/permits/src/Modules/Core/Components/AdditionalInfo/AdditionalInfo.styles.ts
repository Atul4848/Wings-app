import { makeStyles, Theme } from '@material-ui/core/styles';
import { styles as commonStyles } from '../PermitUpsert/PermitUpsert.styles';

export const useStyles = makeStyles((theme: Theme) => ({
  ...commonStyles(theme),
  flexWrap: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  inputControlEditMode: {
    paddingTop: theme.spacing(2.5),
  },
  containerClass: {
    paddingTop: '23px',
  },
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  gridRoot:{
    marginTop:'10px',
    marginBottom: '40px',
    '& > div':{
      minHeight: '300px',
      padding: 0,
    },
  },
}));

import { makeStyles, Theme } from '@material-ui/core/styles';
import { styles as commonStyles } from '../PermitUpsert/PermitUpsert.styles';

export const useStyles = makeStyles((theme: Theme) => ({
  ...commonStyles(theme),
  filledError: {
    color: '#cd263c',
  },
  editorWrapperContainer: {
    overflow: 'auto',
    paddingBottom: '20px',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  flexRow:{
    overflow:'visible',
    flexBasis: 'auto',
  },
}));

import { makeStyles } from '@material-ui/core';
import { ITheme } from '@uvgo-shared/themes';

export const useStyles = makeStyles((theme: ITheme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
}));

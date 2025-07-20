import { makeStyles } from '@material-ui/core';
import { ITheme } from '@uvgo-shared/themes';

export const useStyles = makeStyles((theme: ITheme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  chip: {
    minWidth: 40,
    maxHeight: 30,
    height: 30,
    marginRight: theme.spacing(0.5),
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.25),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '100%',
  },
}));

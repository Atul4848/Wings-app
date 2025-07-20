import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  validationNotes: {
    flexBasis: '100%',
  },
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  labelRoot: {
    padding: 0,
    fontSize: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingRight: 16,
    '& label': {
      lineHeight: 1.68,
      fontSize: 12,
      fontWeight: 600,
    },
  },
  labelRootDisable: {
    color: theme.palette.text.disabled,
  },
  checkboxRoot: {
    padding: '9px 0',
    marginTop: '14px',
  },
}));

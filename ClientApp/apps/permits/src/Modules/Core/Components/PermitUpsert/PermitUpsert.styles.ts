import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2),
      flex: 1,
      overflowY: 'auto',
      padding: theme.spacing(2),
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    auditControl: {
      flexBasis: '25%',
    },
    flexRow: {
      padding: 0,
    },
    content: {
      height: 'calc(100% - 100px)',
      width: '100%',
      overflowY: 'auto',
    },
    modalWidth: {
      width: '900px',
    },
    textBox: {
      width: '100%',
      border: '1px solid #ddd',
      resize: 'none',
      outline: 'none',
    },
    error: {
      color: theme.palette.error.main,
    },
    actionWrapper: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      alignItems: 'flex-end',
    },
    wrapper: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      paddingBottom: 10,
    },
    eyeIcon: {
      height: '20px',
      width: '20px',
      marginLeft: '20px',
      cursor: 'pointer',
      color: theme.palette.text.primary,
      pointerEvents: 'all',
    },
    textInput: {
      '& p': {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  auditControl: {
    flexBasis: '25%',
  },
  flexRow: {
    padding: 0,
  },
  content: {
    height: 'calc(100% - 100px)',
    width: '100%',
    overflowY: 'auto',
  },
  modalWidth: {
    width: '900px',
  },
  textBox: {
    width: '100%',
    border: '1px solid #ddd',
    resize: 'none',
    outline: 'none',
  },
  error: {
    color: theme.palette.error.main,
  },
  actionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-end',
  },
  wrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  eyeIcon: {
    height: '20px',
    width: '20px',
    marginLeft: '20px',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    pointerEvents: 'all',
  },
  textInput: {
    '& p': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
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

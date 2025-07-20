import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      height: 'calc(100% - 5px)',
      width: '100%',
    },
    reactQuill: {
      '& div.ql-editor': {
        minHeight: 100,
        maxHeight: 200,
        overflowY: 'auto',
      },
      '& div.ql-tooltip': {
        marginLeft: theme.spacing(1),
      },
      '& span.ql-picker-options': {
        maxHeight: theme.spacing(16),
        overflow: 'auto',
      },
      '& .ql-editor iframe': {
        width: '100% !important',
        Height: '100% !important',
      },
    },
    expandedEditor: {
      height: 'calc(100% - 50px)',
      overflowY: 'inherit',
      '& div.ql-editor': {
        minHeight: '100%',
      },
    },
    hideToolbar: {
      borderTop: '1px solid #ccc',
      '& div.ql-toolbar.ql-snow': {
        display: 'none',
      },
    },
    iconButton: { padding: 5 },
    textRoot: {
      textAlign: 'left',
    },
    customLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    error: {
      overflowY: 'hidden',
      paddingBottom: 30,
      border: '1px solid #f20000',
      '& .ql-container': {
        borderColor: 'transparent',
      },
    },
    errorLabel: {
      marginTop: '4px',
      fontSize: '0.75rem',
    },
  });

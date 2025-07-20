import { Theme, createStyles, lighten } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    formFileUpload: {
      height: '16rem',
      textAlign: 'center',
      position: 'relative',
    },
    inputFileUpload: {
      display: 'none',
    },
    uploadButton: {
      cursor: 'pointer',
      padding: '0.25rem',
      fontSize: '1rem',
      border: 'none',
      backgroundColor: 'transparent',
      '&:hover': {
        textDecorationLine: 'underline',
      },
    },
    dragFileElement: {
      position: 'absolute',
      width: '90%',
      height: '100%',
      borderRadius: '1rem',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
    labelFileUpload: {
      margin: '10px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: '2px',
      borderRadius: '1rem',
      borderStyle: 'dashed',
      borderColor: `${lighten(theme.palette.divider, 0.6)}`,
      backgroundColor: theme.palette.background.paper,
    },
    dragActive: {
      backgroundColor: '#f8fafc',
    },
  });

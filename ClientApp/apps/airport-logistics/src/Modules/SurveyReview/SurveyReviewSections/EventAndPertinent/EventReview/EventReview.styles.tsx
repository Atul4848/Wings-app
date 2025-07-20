import { createStyles, lighten, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      borderBottom: `1px dashed ${lighten(theme.palette.divider, 0.6)}`,
      '&:last-child': {
        borderWidth: 0,
      },
    },
    section: {
      display: 'flex',
      alignItems: 'center',
      padding: '7px 0',
    },
    editor: {
      width: 500,
    },
    label: {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '25%',
    },
    removeButton: {
      width: 40,
      height: 40,
    },
    addButton: {
      marginTop: 20,
      width: 150,
    },
    approved: {
      fontSize: '1rem',
      color: theme.palette.success.main,
    },
    unApproved: {
      fontSize: '1rem',
      color: theme.palette.warning.main,
    },
  });

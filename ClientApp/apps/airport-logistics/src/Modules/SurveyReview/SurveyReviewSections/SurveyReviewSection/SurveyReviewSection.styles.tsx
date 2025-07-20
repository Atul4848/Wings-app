import { createStyles, fade, lighten, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      marginBottom: 5,
      position: 'relative',
      borderRadius: 4,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: `${theme.palette.background.paper}
        ${theme.palette.background.paper}
        ${lighten(theme.palette.divider, 0.6)}
        ${theme.palette.background.paper}`,

      '&:last-child': {
        borderBottom: 0,
      },
    },
    overlay: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      paddingRight: 15,
      width: '100%',
      height: '100%',
      background: fade(theme.palette.divider, 0.5),
    },
    isApproved: {
      border: `1px dashed ${theme.palette.success.main}`,
    },
    isIgnored: {
      border: `1px dashed ${theme.palette.error.main}`,
    },
    section: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
    },
    sectionApproved: {
      marginBottom: 15,
    },
    list: {
      display: 'grid',
      gridAutoFlow: 'row',
      gridTemplateColumns: 'repeat(2, auto)',
    },
    listItem: {
      marginBottom: '5px',
    },
    label: {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '25%',
      paddingRight: 15,
    },
    actions: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    editor: {
      display: 'flex',
      flexBasis: '100%',
      alignItems: 'center',
      position: 'relative',
      padding: '10px 150px 10px 10px',
      borderRadius: 6,
      backgroundColor: theme.palette.background.paper,
    },
    backdrop: {
      '&:before': {
        content: '""',
        display: 'block',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'rgba(0, 0, 0, .25)',
        zIndex: 10,
      },
      '& $editor': {
        zIndex: 20,
      },
    },
    oneColumn: {
      gridTemplateColumns: 'repeat(1, auto)',
    },
    threeColumns: {
      gridTemplateColumns: 'repeat(3, auto)',
    },
    hourDetails: {
      background: theme.palette.grey['A400'],
      padding: 15,
      borderRadius: 4,
      maxWidth: 700,
    },
    hourDetailsRow: {
      display: 'flex',
      marginBottom: 5,
    },
    hourDetailLabel: {
      flexBasis: '50%',
    },
    hourDetailValue: {
      flexBasis: '50%',
    },
    fieldContainer: {
      maxWidth: 500,
      padding: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      borderBottom: `1px dashed ${lighten(theme.palette.divider, 0.6)}`,
    },
    fieldLabel: {
      marginBottom: 5,
    },
  });

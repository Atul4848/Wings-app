import { createStyles, Theme } from '@material-ui/core';

export const styles = ({ palette }: Theme) =>
  createStyles({
    container: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
    },
    drawerPaper: {
      width: '100%',
      overflowY: 'hidden',
    },
    content: {
      flexGrow: 1,
    },
    infoPane: {
      display: 'block',
      flex: 1,
      width: '100%',
      height: '200px',
      padding: 10,
      paddingTop: 0,
      backgroundColor: palette.background.paper,
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      width: '100%',
      maxHeight: 40,
      display: 'flex',
      borderTop: '2px solid',
      borderTopColor: palette.divider,
      flexDirection: 'row',
      flex: 0,
    },
    dragger: {
      width: '100%',
      cursor: 'row-resize',
      padding: '4px 0 0',
      maxHeight: '50px',
      display: 'flex',
      flex: 1,
      justifyContent: 'center',
    },
    iconButton: {
      display: 'flex',
      flex: 0,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContainer: {
      display: 'flex',
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      paddingBottom: 40,
      width: '100%',
      borderTop: '2px solid',
      borderTopColor: palette.divider,
    },
  });

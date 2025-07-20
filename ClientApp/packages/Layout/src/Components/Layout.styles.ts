import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (_: Theme) =>
  createStyles({
    '@global': {
      '.layout-root': {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      },
      '.layout-contentWrapper': {
        display: 'flex',
        width: '100%',
        // height: 'calc(100% - 70px)', // minus header height
        height: '100%',
        position: 'relative',
      },
      '.layout-content': {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        overflowY: 'auto',
        padding: '10px 25px 10px 25px',
      },
      '.layout-loader': {
        left: 0,
        top: 0,
        width: '100%',
      },
    },
  });

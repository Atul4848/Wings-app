import { makeStyles } from '@material-ui/core';

export const useUsersActionRendererClasses = makeStyles((theme: any) => {
  return {
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
    },
    customToolTip: {
      border: `1px solid ${theme.palette.background.default}`,
      background: theme.palette.background.paper,
    },
    customArrow: {
      '&::before': {
        border: `1px solid ${theme.palette.background.default}`,
      },
      color: theme.palette.background.paper,
    },
    disabled: {
      pointerEvents: 'none',

      '& svg': {
        fill: 'rgba(0, 0, 0, 0.25) !important'
      },
    }
  };
});

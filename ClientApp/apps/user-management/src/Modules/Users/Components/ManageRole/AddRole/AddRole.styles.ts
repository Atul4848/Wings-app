import { makeStyles } from '@material-ui/core';

export const useAddRoleClasses = makeStyles((theme: any) => {
  return {
    dialogWidth: { width: 700 },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: theme.palette.background.paper,
        '& h3':{
          fontSize: 18,
          fontWeight: 600,
          color: theme.palette.grey.A700,
        },
      },
    },
    headerWrapper:{
      '& svg.MuiSvgIcon-root':{
        display: 'none',
      },
    },
    controls: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  }
});

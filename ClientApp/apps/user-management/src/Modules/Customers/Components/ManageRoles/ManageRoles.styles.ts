import { makeStyles } from '@material-ui/core';

export const useManageRolesStyles = makeStyles((theme: any) => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      padding: 20,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    heading: {
      lineHeight: '38px',
      fontSize: '18px',
      fontWeight: 600,
    },
    content: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flexGrow: 1,
    },
  };
});

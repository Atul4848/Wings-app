import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    boxheading: {
      paddingRight: '15px',
      fontWeight: 600,
      display: 'flex',
      borderRadius: '5px',
    },
    edit: {
      minWidth: '30px',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '15px',
      color: theme.palette.grey.A700,
    },
    username: {
      fontWeight: 'normal',
      fontSize: '13px',
      margin: 0,
    },
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      width: '150px',
      textAlign: 'center',
    },
    icon: {
      height: '50px',
      width: '50px',
      display: 'inline-block',
    },
    subtitle: {
      lineHeight: '17px',
      paddingTop: '8px',
      display: 'inline-block',
    },
    editBtn:{
      paddingLeft: 5,
      paddingTop: 8,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  });

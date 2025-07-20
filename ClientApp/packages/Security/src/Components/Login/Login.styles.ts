import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    loginPage: {
      background: theme.palette.background.default,
      minHeight: '100vh',
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
    },
    main: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    login: {
      position: 'relative',
      padding: '0 30px',
      minWidth: '1050px',
      width: '100%',
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '70px 0 0 0',
      zIndex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      minWidth: '1050px',
      height: '340px',
      background: theme.palette.primary.main,
      zIndex: 0,
    },
    header: {
      margin: '0 auto',
    },
    logo: {
      margin: '10px 0 30px',
    },
    content: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      background: theme.palette.background.paper,
      padding: '60px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, .2)',
      borderRadius: '4px',
    },
    column: {
      position: 'relative',
      width: '100%',
      padding: '15px',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      display: 'block',
      margin: '0 auto',
    },
    subtitle: {
      width: '100%',
      margin: '20px 0',
      textAlign: 'center',
      fontSize: '16px',
      color: theme.palette.text.primary,
    },
    browsers: {
      textAlign: 'center',
      padding: '10px',
      maxWidth: '550px',
      marginTop: '30px',
    },
    browserIcon: {
      display: 'flex',
      maxWidth: '500px',
      margin: '0 auto',
    },
    browser: {
      flex: 1,
      textAlign: 'center',
      padding: '10px',
    },
    icon: {
      height: '36px',
      margin: '0 0 5px 0',
      '& > div': {
        width: '100%',
        height: '100%',
      },
    },
  });

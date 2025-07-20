import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    headerWrapper: {
      position: 'relative',
      zIndex: 2,
    },

    header: {
      backgroundColor: '#1C1E1F',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '70px',
      padding: '0 16px',
      color: '#FFFFFF',
    },
    headerLeft: {
      display: 'flex',
      flexGrow: 1,
      flexBasis: '160px',
      justifyContent: 'flex-start',
      gap: 30,
    },
    appEnvName: {
      color: '#FFFFFF',
      transition: '.2s',
      opacity: '.5',
      letterSpacing: '1.5px',
      fontSize: '20px',
      marginTop: '5px',
      fontWeight: 700,
      '&:hover': {
        opacity: 1,
      },
    },
    headerCenter: {
      display: 'flex',
      flexGrow: 2,
      justifyContent: 'center',
      height: '100%',
      alignItems: 'flex-end',
    },
    headerRight: {
      display: 'flex',
      flexGrow: 1,
      flexBasis: '160px',
      justifyContent: 'flex-end',
      height: '100%',
      alignItems: 'center',
    },
    headerNavlinks: {
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'center',
      height: '100%',
      alignItems: 'flex-end',
    },

    navLink: {
      height: '100%',

      '& a': {
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0px 12px',
        color: '#1C1E1F',
        borderBottom: '3px solid transparent',
        transition: '.2s',
        opacity: 1,
        cursor: 'pointer',
        textDecoration: 'none',
      },
      
      '& a:hover &__icon': {
        backgroundColor: '#004BA0',
      },

      '& a.active &__icon': {
        opacity: 1,
        backgroundColor: '#004BA0',
      },

      '&__icon': {
        position: 'relative',
        display: 'inline-block',
        width: '32px',
        height: '32px',
        margin: '0 0 8px 0',
        padding: '8px',
        fontSize: '16px',
        borderRadius: '50%',
        color: '#FFFFFF',
        // backgroundColor: (props: styleProps) => props.bgColor,
        backgroundColor: '#1976D2',
      },

      '&__text': {
        display: 'block',
        fontSize: '11px',
        fontWeight: 500,
        color: theme.palette.text.primary,
        textTransform: 'uppercase',
        letterSpacing: '.2px',
      },
    },

    menuButton: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      alignSelf: 'flex-end',
      padding: '8px 12px 8px 12px',
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      transition: '.2s',
      opacity: '.5',

      '& a': {
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: '#FFFFFF',
        cursor: 'pointer',
        textDecoration: 'none',
        marginBottom: '-3px',
      },

      '& a.active &__icon': {
        opacity: 1,
        backgroundColor: '#004BA0',
      },

      '&:hover': {
        opacity: 1,
        cursor: 'pointer',
      },

      '&--active': {
        borderBottom: '3px solid #FFFFFF',
        opacity: 1,
      },

      '&__icon': {
        position: 'relative',
        display: 'inline-block',
        width: '24px',
        height: '24px',
        margin: '0 0 8px 0',
      },

      '&__text': {
        display: 'block',
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '.2px',
      },
    },

    pinButtonWrapper: {
      color: '#005295',
      minWidth: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    subHeader: {
      backgroundColor: theme.palette.background.paper,
      position: 'absolute',
      boxShadow: `0px 3px 4px 1px ${theme.palette.text.primary}40`,
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      padding: '0 16px',
      borderBottom: `1px solid ${theme.palette.text.primary}40`,
      color: '#FFFFFF',
      flexGrow: 1,
      justifyContent: 'center',
      height: '70px',
    },

    subHeaderExpanded: {
      backgroundColor: theme.palette.background.paper,
      position: 'relative',
      boxShadow: 'none',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      padding: '0 16px',
      borderBottom: `1px solid ${theme.palette.text.primary}40`,
      color: '#FFFFFF',
      flexGrow: 1,
      justifyContent: 'center',
      height: '70px',
    },

    subHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      flexGrow: 1,
      flexBasis: '160px',
      height: '100%',
      padding: '0px',
    },

    subHeaderCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      flexGrow: 2,
      height: '100%',
      padding: '0px',
    },

    subHeaderRight: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      flexGrow: 1,
      flexBasis: '160px',
      height: '100%',
      padding: '0px',
    },
  });

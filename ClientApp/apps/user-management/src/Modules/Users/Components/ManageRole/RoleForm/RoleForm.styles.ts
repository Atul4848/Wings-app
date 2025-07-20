import { makeStyles } from '@material-ui/core';

export const useRoleFormClasses = makeStyles((theme: any) => {
  const resetInputStyles = {
    '& > div:only-child': {
      flexBasis: '100%',
      width: '100%',
      padding: 0,
    }
  };

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
    },
    sectionTitle: {
      fontSize: 18,
      marginTop: 0,
      fontWeight: 600,
      marginBottom: 10,
    },
    sectionContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    sectionRow: {
      ...resetInputStyles,

      display: 'flex',
      flexDirection: 'row',
      gap: 16,
      width: '100%',
    },
    sectionColumn: {
      ...resetInputStyles,

      flexBasis: 0,
      flexGrow: 1,
    },
    roleOptionHeader: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    roleOptionName: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    roleOptionType: {
      opacity: 0.75,
      fontSize: 10,
      fontFamily: 'monospace',
      letterSpacing: -0.3,
    },
    roleOptionDescription: {
      fontSize: 12,
      wordBreak: 'break-word',
      whiteSpace: 'normal',
      marginBottom: 2,
    },
    errorMessage: {
      color: theme.palette.error.main,
      fontSize: 14,
      marginBottom: 8,
    }
  };
});

import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      overflow: 'hidden',
    },
    headerLabelContainer: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      justifyContent: 'flex-start',
    },
    customHeaderMenuButton: {
      display: 'flex',
      flex: 0,
      padding: 0,
      justifyContent: 'flex-end',
      minWidth: spacing(2),
      '&:hover svg': {
        color: palette.primary.main,
      },
    },
    customFilterIcon: {
      display: 'flex',
      flex: 0,
      padding: 0,
      justifyContent: 'flex-end',
      minWidth: spacing(2),
      marginTop:2,
      marginLeft:2,
    },
    customHeaderLabel: {
      display: 'flex',
      flex: 0,
      justifySelf: 'flex-start',
      alignItems: 'center',
      '&:hover': {
        color: palette.primary.contrastText,
      },
    },
    customSortIcon: {
      display: 'flex',
      flex: 0,
      alignItems: 'center',
      paddingLeft: spacing(0.5),
    },
    menuIcon: {
      fontWeight: 100,
      fontSize: spacing(2),
    },
  });

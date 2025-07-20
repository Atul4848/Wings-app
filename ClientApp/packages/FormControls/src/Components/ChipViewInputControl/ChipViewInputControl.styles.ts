import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      flexBasis: '33.3%',
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    textRoot: {
      textAlign: 'left',
      marginBottom: theme.spacing(0.5),
      fontWeight: 600,
      fontSize: '12px',
    },
    chip: {
      marginRight: theme.spacing(1),
      maxHeight: theme.spacing(2.5),
    },
    leftIndent: {
      paddingLeft: theme.spacing(6),
    },
    multiline: {
      alignItems: 'baseline',
      minHeight: 100,
    },
  });

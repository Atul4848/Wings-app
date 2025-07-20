import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    textRoot: {
      textAlign: 'left',
      marginBottom: theme.spacing(0.5),
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: 1.78,
      '& [class*="MuiFormLabel-asterisk"]': {
        color: 'red',
        fontWeight: 600,
      },
    },
    chip: {
      marginRight: theme.spacing(1),
      maxWidth: 200,
      minWidth: 40,
      maxHeight: 30,
    },
    leftIndent: {
      paddingLeft: theme.spacing(6),
    },
    multiline: {
      alignItems: 'baseline',
      minHeight: 100,
    },
    textEllipsis: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    }
  });

import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    flexRow: {
      display: 'flex',
      paddingRight: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    },
    inputAdornment: {
      paddingRight: theme.spacing(1.5),
      margin: 0,
    },
    editorOuter: {
      border: `1px solid ${theme.palette.grey['600']}`,
      overflowY: 'auto',
      minHeight: 150,
      maxHeight: 350,
      padding: theme.spacing(1),
      paddingTop: 0,
      marginRight: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  });

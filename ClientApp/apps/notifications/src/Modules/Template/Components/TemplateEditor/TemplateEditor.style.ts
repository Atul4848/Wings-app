import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    flexRow: {
      display: 'flex',
      flex: 1,
      width: '100%',
      overflowY: 'auto',
      flexDirection: 'column',
    },
    flexWrap: {
      flexWrap: 'wrap',
      display: 'flex',
    },
    inputControl: {
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
      flexBasis: '33%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    inputControlContent: {
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
      minHeight: 463,
      overflow: 'hidden',
      height: 'calc(100% - 230px)',
      flexBasis: '80%',
    },
    expandEditor: {
      height: 'calc(100% - 50px)',
      '& div.ql-editor': {
        minHeight: '100%',
      },
      '& .ql-container': {
        height: 'calc(100% - 41px)',
      },
    },
  });

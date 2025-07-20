import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing }: Theme) =>
  createStyles({
    headerActionsEditMode: {
      justifyContent: 'space-between',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: spacing(2),
      height: 'calc(100% - 50px)',
      overflow: 'hidden',
    },
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
      paddingBottom: spacing(3),
      paddingRight: spacing(3),
      flexBasis: '33%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  });

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  headerActionsEditMode: {
    justifyContent: 'space-between',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing(2),
    height: 'calc(100% - 50px)',
    overflow: 'hidden',
  },
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
    paddingBottom: spacing(3),
    paddingRight: spacing(3),
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

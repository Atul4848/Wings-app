import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ spacing }: Theme) =>
  createStyles({
    root: {
      height: '100%',
      paddingTop: spacing(1),
      flex: 1,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: spacing(2),
      height: 'calc(100% - 58px)',
      overflow: 'hidden',
    },
    backButton: {
      paddingBottom: spacing(2),
      display: 'flex',
      justifyContent: 'space-between',
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    headerDetails: {
      display: 'flex',
      alignItems: 'center',
    },
    placeHolder: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
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
    childInputControl: {
      paddingBottom: spacing(3),
      paddingRight: spacing(3),
      flexBasis: '60%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    content: {
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      minWidth: 'fit-content',
      height: 'calc(100vh - 335px)',
      padding: '24px 0',
    },
    labelFields: {
      height: 55,
      paddingTop: 10,
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
    editorWrapperContainer: {
      padding: '16px',
    },
    title: {
      marginLeft: '10px',
    },
    containerClass: {
      marginTop: 0,
    },
  });

export const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    height: '100%',
    paddingTop: spacing(1),
    flex: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing(2),
    height: 'calc(100% - 58px)',
    overflow: 'hidden',
  },
  backButton: {
    paddingBottom: spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerDetails: {
    display: 'flex',
    alignItems: 'center',
  },
  placeHolder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
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
  childInputControl: {
    paddingBottom: spacing(3),
    paddingRight: spacing(3),
    flexBasis: '60%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minWidth: 'fit-content',
    height: 'calc(100vh - 335px)',
    padding: '24px 0',
  },
  labelFields: {
    height: 55,
    paddingTop: 10,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  editorWrapperContainer: {
    padding: '16px',
  },
  title: {
    marginLeft: '10px',
  },
  containerClass: {
    marginTop: 0,
  },
}));

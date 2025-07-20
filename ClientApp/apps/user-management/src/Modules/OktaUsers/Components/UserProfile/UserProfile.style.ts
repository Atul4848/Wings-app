import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '15px',
      color: theme.palette.grey.A700,
    },
    inputControl: {
      color: theme.palette.grey.A700,
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
      flexBasis: '33%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      '& label': {
        fontWeight: '600',
        color: theme.palette.grey.A700,
      },
      '& span': {
        fontWeight: '600',
      },
    },
    searchContainer: {
      paddingBottom: theme.spacing(3),
      paddingRight: theme.spacing(3),
      flexBasis: '33%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    titleHeading: {
      fontWeight: 600,
    },
    mainSection: {
      overflowY: 'auto',
      height: 'calc(100vh - 128px)',
    },
    mainWrapper: {
      '& > div > div': {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        padding: 0,
      },
    },
    groupContainer: {
      background: theme.palette.background.default,
      padding: 15,
    },
    boxSection: {
      background: theme.palette.background.paper,
      padding: '15px 15px 0',
      marginBottom: 10,
    },
    boxGroup: {
      background: theme.palette.background.paper,
      padding: '15px 15px 0',
    },
    btnSection: {
      position: 'absolute',
      top: 10,
    },
  });
  
export const useStyles = makeStyles((theme: Theme) => ({
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
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '15px',
    color: theme.palette.grey.A700,
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
    },
    '& span': {
      fontWeight: '600',
    },
  },
  active: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.green,
      fontWeight: '600',
    },
  },
  stagedProvisioned: {
    '& input': {
      color: theme.palette.basicPalette.primary,
      fontWeight: '600',
    },
  },
  deprovisionedsuspended: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.gray,
      fontWeight: '600',
    },
  },
  inactiveStatus: {
    '& input': {
      color: theme.palette.basicPalette.accent,
      fontWeight: '600',
    },
  },
  recovery: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.orange,
      fontWeight: '600',
    },
  },
  searchContainer: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '33%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  titleHeading: {
    fontWeight: 600,
  },
  mainSection: {
    overflowY: 'auto',
    height: 'calc(100vh - 128px)',
  },
  mainWrapper: {
    '& > div > div': {
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: 0,
    },
  },
  groupContainer: {
    background: theme.palette.background.default,
    padding: 15,
  },
  boxSection: {
    background: theme.palette.background.paper,
    padding: '15px 15px 0',
    marginBottom: 10,
  },
  boxGroup: {
    background: theme.palette.background.paper,
    padding: '15px 15px 0',
  },
  btnSection: {
    position: 'absolute',
    top: 10,
  },
  spaceSection:{
    marginRight: 10,
  },
}));
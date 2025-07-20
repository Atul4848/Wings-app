import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    pic: {
      marginRight: '6px',
    },
    modaldetail: {
      paddingBottom: '20px',
    },
    groupsection: {
      padding: '5px 20px 10px',
    },
    groupheading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
      paddingRight: 30,
      '@media (max-width: 1200px)': {
        paddingRight: 0,
      },
    },
    modalheading: {
      paddingBottom: '5px',
      color: palette.grey.A700,
      fontWeight: 600,
    },
    cardcontainer: {
      marginBottom: '8px',
    },
    cardbox: {
      padding: '10px !important',
      backgroundColor: palette.background.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid #ddd',
    },
    addIcon: {
      color: palette.basicPalette.primary,
    },
    close: {
      minWidth: 30,
      padding: '1px 5px',
      marginLeft: '5px',
    },
    selectedgroup: {
      padding: '5px 20px 10px',
    },
    selectgroup: { width: 200 },
    detaillist: {
      height: '180px',
      overflowY: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
    },
    add: {
      minWidth: 48,
      padding: '2px 9px',
      marginLeft: '5px',
    },
    userGroupWidth: { width: 1400 },
    modalRoot: {
      '& div.MuiPaper-root': {
        background: palette.background.default,
        padding: 0,
      },
      '& div.MuiCard-root': {
        flexBasis: '33%',
        textOverflow: 'ellipsis',
        paddingRight: 16,
        border: 0,
        '@media (max-width: 1200px)': {
          flexBasis: '50%',
          '&:nth-child(2n+0)': {
            paddingRight: 0,
          },
        },
        '@media (max-width: 768px)': {
          flexBasis: '100%',
          paddingRight: 0,
        },
      },
    },
    subSection: {
      display: 'flex',
      alignItems: 'center',
    },
    customLoader: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20%',
    },
    groupText: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      width: '90%',
      whiteSpace: 'nowrap',
      lineHeight: 'normal',
      color: palette.grey.A700,
    },
    subSectionContainer:{
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      width: '90%',
      whiteSpace: 'nowrap',
    },
    fullName: {
      position: 'relative',
      left: '30px',
    },
    groupSubHeader: {
      borderBottom: '1px solid #ddd',
      paddingBottom: 5,
      marginBottom: 20,
      color: palette.grey.A700,
    },
    headerWrapper: {
      background: palette.basicPalette.primary,
      color: palette.background.default,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      '& h3': {
        justifyContent: 'center',
      },
      '& div': {
        marginRight: '20px !important',
        color: palette.background.default,
      },
    },
  });

export const useStyles = makeStyles((theme: Theme) => ({
  pic: {
    marginRight: '6px',
  },
  modaldetail: {
    paddingBottom: '20px',
  },
  groupsection: {
    padding: '5px 20px 10px',
  },
  groupheading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    paddingRight: 30,
    '@media (max-width: 1200px)': {
      paddingRight: 0,
    },
  },
  modalheading: {
    paddingBottom: '5px',
    color: theme.palette.grey.A700,
    fontWeight: 600,
  },
  cardcontainer: {
    marginBottom: '8px',
  },
  cardbox: {
    padding: '10px !important',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #ddd',
  },
  addIcon: {
    color: theme.palette.basicPalette.primary,
  },
  close: {
    minWidth: 30,
    padding: '1px 5px',
    marginLeft: '5px',
  },
  selectedgroup: {
    padding: '5px 20px 10px',
  },
  selectgroup: { width: 200 },
  detaillist: {
    height: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
  },
  add: {
    minWidth: 48,
    padding: '2px 9px',
    marginLeft: '5px',
  },
  userGroupWidth: { width: 1400 },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.default,
      padding: 0,
    },
    '& div.MuiCard-root': {
      flexBasis: '33%',
      textOverflow: 'ellipsis',
      paddingRight: 16,
      border: 0,
      '@media (max-width: 1200px)': {
        flexBasis: '50%',
        '&:nth-child(2n+0)': {
          paddingRight: 0,
        },
      },
      '@media (max-width: 768px)': {
        flexBasis: '100%',
        paddingRight: 0,
      },
    },
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  customLoader: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20%',
  },
  groupText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '90%',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
    color: theme.palette.grey.A700,
  },
  subSectionContainer:{
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '90%',
    whiteSpace: 'nowrap',
  },
  fullName: {
    position: 'relative',
    left: '30px',
  },
  groupSubHeader: {
    borderBottom: '1px solid #ddd',
    paddingBottom: 5,
    marginBottom: 20,
    color: theme.palette.grey.A700,
  },
  headerWrapper: {
    background: theme.palette.basicPalette.primary,
    color: theme.palette.background.default,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '& h3': {
      justifyContent: 'center',
    },
    '& div': {
      marginRight: '20px !important',
      color: theme.palette.background.default,
    },
  },
}));
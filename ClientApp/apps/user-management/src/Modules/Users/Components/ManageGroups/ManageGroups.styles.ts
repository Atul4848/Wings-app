import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    modaldetail: {
      padding: '7px 42px 40px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    groupsection: {
      width: 392,
    },
    groupheading: {
      marginBottom: 10,
      padding: 7,
      '@media (max-width: 1200px)': {
        paddingRight: 0,
      },
    },
    modalheading: {
      paddingBottom: '5px',
      color: palette.grey.A700,
      fontWeight: 600,
      fontSize: 18,
    },
    iconBtn:{
      marginTop: 210,
      '& button': {
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    cardbox: {
      padding: '10px !important',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedgroup: {
      width: 392,
    },
    selectgroup: { 
      width: '100%',
      '& fieldset': {       
        border: 0,
      },
      '& svg': {       
        display: 'none',
      },
      '& input': {       
        backgroundColor: 'transparent',
      },
      '& div.MuiOutlinedInput-adornedEnd': {       
        backgroundColor: palette.basicPalette.background,
        height: 40,
        borderRadius: 22,
      },
    },
    detaillist: {
      height: '445px',
      border: `1px solid ${palette.divider}`,
      overflowY: 'auto',
      borderRadius: '4px',
      '&::-webkit-scrollbar-track': {
        marginTop: 5,
        borderRadius: 10,
        backgroundColor: palette.background.paper,
      },
      '&::-webkit-scrollbar': {
        width: 8,
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 10,
        backgroundColor: palette.basicPalette.background,
      },
    },
    userGroupWidth: { width: 940 },
    modalRoot: {
      '& div.MuiPaper-root': {
        padding: 0,
      },
      '& div.MuiCard-root': {
        border: 0,
        marginBottom: 8,
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
      '& div.MuiCard-root.cardContainer': {
        background: palette.basicPalette.background,
      },
    },
    subSection: {
      display: 'flex',
      alignItems: 'center',
    },
    groupText: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      width: '100%',
      whiteSpace: 'nowrap',
      lineHeight: 'normal',
      color: palette.grey.A700,
    },
    subSectionContainer: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      width: '100%',
      whiteSpace: 'nowrap',
    },
    fullName: {
      position: 'relative',
      left: '30px',
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
    availableGroups: {
      border: `1px solid ${palette.divider}`,
      borderRadius: '4px',
    },
    groupsList: {
      height: '379px',
      overflowY: 'auto',
      '&::-webkit-scrollbar-track': {
        marginTop: 5,
        borderRadius: 10,
        backgroundColor: palette.background.paper,
      },
      '&::-webkit-scrollbar': {
        width: 8,
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 10,
        backgroundColor: palette.basicPalette.background,
      },
    },
  });
export const useStyles = makeStyles((theme: Theme) => ({
  modaldetail: {
    padding: '7px 42px 40px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  groupsection: {
    width: 392,
  },
  groupheading: {
    marginBottom: 10,
    padding: 7,
    '@media (max-width: 1200px)': {
      paddingRight: 0,
    },
  },
  modalheading: {
    paddingBottom: '5px',
    color: theme.palette.grey.A700,
    fontWeight: 600,
    fontSize: 18,
  },
  iconBtn:{
    marginTop: 210,
    '& button': {
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  cardbox: {
    padding: '10px !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedgroup: {
    width: 392,
  },
  selectgroup: { 
    width: '100%',
    '& fieldset': {       
      border: 0,
    },
    '& svg': {       
      display: 'none',
    },
    '& input': {       
      backgroundColor: 'transparent',
    },
    '& div.MuiOutlinedInput-adornedEnd': {       
      backgroundColor: theme.palette.basicPalette.background,
      height: 40,
      borderRadius: 22,
    },
  },
  detaillist: {
    height: '445px',
    border: `1px solid ${theme.palette.divider}`,
    overflowY: 'auto',
    borderRadius: '4px',
    '&::-webkit-scrollbar-track': {
      marginTop: 5,
      borderRadius: 10,
      backgroundColor: theme.palette.background.paper,
    },
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: theme.palette.basicPalette.background,
    },
  },
  userGroupWidth: { width: 940 },
  modalRoot: {
    '& div.MuiPaper-root': {
      padding: 0,
    },
    '& div.MuiCard-root': {
      border: 0,
      marginBottom: 8,
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
    '& div.MuiCard-root.cardContainer': {
      background: theme.palette.basicPalette.background,
    },
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  groupText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '100%',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
    color: theme.palette.grey.A700,
  },
  subSectionContainer: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '100%',
    whiteSpace: 'nowrap',
  },
  fullName: {
    position: 'relative',
    left: '30px',
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
  availableGroups: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
  },
  groupsList: {
    height: '379px',
    overflowY: 'auto',
    '&::-webkit-scrollbar-track': {
      marginTop: 5,
      borderRadius: 10,
      backgroundColor: theme.palette.background.paper,
    },
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: theme.palette.basicPalette.background,
    },
  },
}));
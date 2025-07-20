import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  btnContainerCancel: {
    '& button': {
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      width: 100,
      marginRight: 20,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
  },
  btnContainerSave: {
    '& button': {
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
      },
      backgroundColor: theme.palette.basicPalette.primary,
      height: 40,
      width: 120,
      textTransform: 'capitalize',
      '& span.MuiButton-label': {
        fontSize: 14,
      },
    },
    '& .MuiButton-contained.Mui-disabled': {
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.background.paper,
    },
  },
  headerWrapper: {
    color: theme.palette.grey.A700,  
    '& h3': {
      fontWeight: 600,
    },   
    '& svg': {
      display: 'none',
    }, 
  },
  btnContainer:{
    marginTop: 50,
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  infoContainer:{
    display: 'flex',
    width: '100%',
  },
  userMappedWidth:{
    width: 1000,
  }, 
  titleContainer :{
    fontSize: 12,
    marginBottom: 5,
    flex: 1,
    paddingLeft: 15,
  },
  heading :{
    fontSize: 12,
    fontWeight: 600,
  },
  modelContainer :{
    display: 'flex',
  },
  detailContainer :{
    display: 'flex',
    height: 300,
    overflowY: 'auto',
    padding: '15px 0',
    border: `1px solid ${theme.palette.divider}`,
    flexWrap: 'wrap',
  },
  detailList: {
    flex: 1,
    padding: '0 15px',
  },
  searchContainer: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
    flexBasis: '40%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  cardContainer: {
    marginBottom: '8px',
    border: 0,
  },
  cardBox: {
    padding: '10px !important',
    background: theme.palette.basicPalette.clockBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  addIcon: {
    color: theme.palette.basicPalette.primary,
  },
  close: {
    minWidth: 30,
    padding: '1px 5px',
    marginLeft: '5px',
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  groupText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '90%',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
    fontWeight: 600,
    color: theme.palette.grey.A700,
  },
  subSectionContainer:{
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '90%',
    whiteSpace: 'nowrap',
  },
  titleContainerFirst :{
    flex: 1,
    fontSize: 12,
    marginBottom: 5,
  },
}));

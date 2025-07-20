import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  modalDetail: {
    paddingBottom: '20px',
    alignContent: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
    '& div.MuiOutlinedInput-adornedEnd': {
      height: 40,
    },
    '& div.MuiInputAdornment-positionStart':{
      display: 'none',
    },
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 40,
    justifyContent: 'flex-end',
  },
  modalHeading:{
    fontWeight: 600,
    color: theme.palette.grey.A700,
    fontSize: '12px !important',
  },
  modalRoot: {
    '& div.MuiDialog-paper': {
      background: theme.palette.background.paper,
      width: '630px',
      '& h3':{
        fontSize: 18,
        fontWeight: 600,
        color: theme.palette.grey.A700,
      },
    },
  },
  headerWrapper:{
    '& svg.MuiSvgIcon-root':{
      display: 'none',
    },
  },
  btnContainerCancel: {
    '& button': {
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      width: 100,
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
      width: 100,
      marginLeft: 20,
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
  fullFlex: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(0),
    flexBasis: '100%',
  },
  detailList: {
    height: '180px',
    overflow: 'auto',
    marginTop: 10,
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
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  pic: {
    marginRight: '6px',
  },
  groupText: {
    fontWeight: 600,
    lineHeight: 'normal',
  },
  fullName: {
    position: 'relative',
    left: '30px',
  },
  close: {
    minWidth: 30,
    padding: '1px 5px',
    marginLeft: '5px',
  },
}));
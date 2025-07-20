import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  modalDetail: {
    alignContent: 'center',
    justifyContent: 'space-around',
    '& div:nth-child(4)': {
      paddingBottom: 5,
    },
    '& input': {
      height: 40,
      fontSize: 12,
    },
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: '12px !important',
    },
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      '& h3':{
        fontSize: 18,
        fontWeight: 600,
        color: theme.palette.grey.A700,
      },
    },
  },
  infoDetail:{
    display: 'flex',
    fontSize: 12,
    marginBottom: 40,
    '& svg': {
      fill: '#1976D2',
    },
    '& div': {
      marginRight: 5,
    },
  },
  dialogWidth: { width: 700 },
  btnContainerCancel: {
    '& button': {
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      border: 0,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      width: 100,
      marginRight: 20,
      '&:hover': {
        backgroundColor: 'transparent',
        border: 0,
      },
    },
  },
  headerWrapper:{
    '& svg.MuiSvgIcon-root':{
      display: 'none',
    },
  },
  inputControlGroup:{
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: 0,
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&:last-child': {
      paddingBottom: 0,
    },
    '& > label':{
      marginTop: 0,
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
      textTransform: 'capitalize',
      '& span.MuiButton-label': {
        fontSize: 14,
      },
    },
    '& .MuiButton-contained.Mui-disabled': {
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.background.paper,
      border: 0,
    },
  },
}));

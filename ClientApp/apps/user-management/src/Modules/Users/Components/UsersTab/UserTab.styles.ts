import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  customLinkBtn: {
    background: theme.palette.background.paper,
    padding: '10px 13px',
    boxShadow: '0px 2px 4px #00000029',
    position: 'absolute',
    width: '100%',
    top: 0,
    marginLeft: -25,
    '& button': {
      backgroundColor: 'transparent',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
  },
  title: {
    fontSize: 18,
    margin: 100,
    display: 'flex',
    justifyContent: 'center',
  },
  notification:{
    background: 'rgba(242, 193, 44, 0.05)',
    border: `1px solid ${theme.palette.basicPalette.additionalColors.yellow}`,
    borderRadius: 6,
    opacity: 1,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 10px',
    marginBottom: 20,
    '& + div div.MuiTabPanel-root > div > div':{
      bottom: 209,
    },
    '& + div div.MuiTabPanel-root div.ps__wrapper button.MuiButton-root':{
      bottom: 61,
    },
    '& + div div.MuiTabPanel-root > div + div button.MuiButton-contained': {
      bottom: 61,
      position: 'relative'
    },
  },
  flexBox:{
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      width: 20,
      fill: theme.palette.basicPalette.additionalColors.yellow,
    },
  },
  btnBox:{
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'capitalize',
    color: theme.palette.background.paper,
    marginLeft: 10,
    backgroundColor: theme.palette.basicPalette.primary,
    height: 27,
    padding: '4px 20px',
    '&:hover': {
      backgroundColor: theme.palette.basicPalette.primaryLight,
    },
  },
  text:{
    marginLeft: 10,
    color: theme.palette.grey.A700,
    fontSize: 14,
  },
  userTab: {
    background: theme.palette.background.paper,
    padding: 15,
    marginTop: 70,
    overflowY: 'auto',
    '& div.ps__wrapper':{
      position: 'inherit !important'
    },
    '&::-webkit-scrollbar-track': {
      marginTop: 5,
      borderRadius: 10,
      backgroundColor: theme.palette.background.paper,
    },
    '&::-webkit-scrollbar': {
      width: 8,
      backgroundColor: theme.palette.background.paper,
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: theme.palette.divider,
    },
    '& div.MuiTabPanel-root': {
      padding: 0,
    },
    '& span.MuiTabs-indicator': {
      padding: 0,
      borderTop: `65px solid ${theme.palette.basicPalette.primary}`,
      width: '5px !important',
      transition: 'none',
    },
    '& button.MuiTab-textColorPrimary': {
      padding: '0 15px',
      width: 200,
      height: 40,
      minHeight: 'auto',
      background: theme.palette.basicPalette.clockBg,
      margin: 0,
      border: 0,
      fontWeight: 600,
      color: theme.palette.basicPalette.textColors.secondary,
      '& span': {
        fontSize: 14,
      },
      '&:first-child': {
        borderLeft: `1px solid ${theme.palette.divider}`,
      },
    },
    '& button.Mui-selected': {
      borderTop: `1px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      borderBottom: 0,
      color: theme.palette.basicPalette.text,
    },
    '& div.MuiTabs-root': {
      border: 0,
      minHeight: 40,
    },
    '& div.MuiTabs-flexContainer': {
      background: theme.palette.basicPalette.clockBg,
    },
  },
}));
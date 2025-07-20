import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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
      border: `1px solid ${theme.palette.divider}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
  },
  flexRowGrid:{
    border: `1px solid ${theme.palette.divider}`,
    padding: 20,
    marginBottom: 20,
    borderTop: 0,
  },
  title: {
    fontSize: 18,
    margin: 100,
    display: 'flex',
    justifyContent: 'center',
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
      width: '3px !important',
      transition: 'none',
    },
    '& button.MuiTab-textColorPrimary': {
      padding: '0 15px',
      width: 200,
      height: 63,
      background: theme.palette.basicPalette.background,
      margin: 0,
      borderTop: `1px solid ${theme.palette.divider}`,
      borderRight: 0,
      fontWeight: 600,
      '& span': {
        fontSize: 14,
      },
      '&:first-child': {
        borderLeft: `1px solid ${theme.palette.divider}`,
      },
      '&:last-child': {
        borderRight: `1px solid ${theme.palette.divider}`,
      },
    },
    '& button.Mui-selected': {
      background: theme.palette.background.paper,
      borderBottom: 0,
      color: theme.palette.basicPalette.primary,
    },
    '& div.MuiTabs-root': {
      border: 0,
      minHeight: 63,
    },
  },
}));
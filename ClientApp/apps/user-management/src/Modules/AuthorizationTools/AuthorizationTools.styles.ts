import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const styles = makeStyles((theme: Theme) =>({
  title: {
    fontSize: 18,
    margin: 100,
    display: 'flex',
    justifyContent: 'center',
  },
  userTab: {
    background: theme.palette.background.paper,
    padding: 15,
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

import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      boxShadow: 'none',
      backgroundColor: theme.palette.background.paper,
      '&:before': {
        backgroundColor: theme.palette.background.paper,
      },
      '&.Mui-expanded': {
        margin: 0,
        '& .MuiSvgIcon-root':{
          transform:'rotate(180deg)',
          backgroundColor: 'rgb(212 243 255 / 50%)',
        },
      },
    },
    titleRoot: {
      '& [class*="MuiAccordionSummary-root"]':{
        display: 'inline-flex',
        paddingLeft: 0,
        flexDirection: 'row-reverse',
        '&.Mui-expanded':{
          minHeight:'64px',
        },
        '& .MuiSvgIcon-root':{
          fontSize:'36px',
          transform: 'rotate(-90deg)',
        },
        '&.Mui-expanded .MuiSvgIcon-root':{
          color: '#1976d2',
          transform: 'rotate(180deg)',
          backgroundColor: 'rgb(212 243 255 / 50%)'
        }
      },
      '& .MuiAccordionSummary-content': {
        margin:'0',
        '& .MuiTypography-h5': {
          fontWeight: 600,
        },
      },
    },
    collapsibleContainer: {
      position: 'relative',
    },
    buttonContainer: {
      display: ' flex',
      gap: '2px',
      justifyContent:'flex-end',
      position: 'absolute',
      zIndex: 1,
      right: '15px',
      top: '20px',
    },
    button: {
      zIndex: 1,
      marginLeft: 'auto',
      top: '15px',
      display: ' flex',
      right: 16,
      position: 'absolute',
    },
  });

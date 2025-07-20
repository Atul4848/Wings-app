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
      display: 'inline-flex',
      paddingLeft: 0,
      flexDirection: 'row-reverse',
      '& .MuiAccordionSummary-content': {
        margin:'0',
        '& .MuiTypography-h5': {
          fontWeight: 600,
        },
      },
    },
    collapseExpandIcon:{
      transform:'rotate(-90deg)',
      padding: '0',
      marginRight: '5px',
      fontSize:'36px',
      color:'#1976d2',
    },
    contentRoot: {
      display: 'block',
      padding: '8px 16px 0px 0px',
    },
    subTitle:{
      alignSelf: 'center',
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      padding: '4px 3px',
    },
  });

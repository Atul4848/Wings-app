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
      },
    },
    titleRoot: {
      display: 'inline-flex',
      paddingLeft: 0,
      '& .MuiAccordionSummary-content': {
        '& .MuiTypography-h5': {
          fontWeight: 600,
        },
      },
    },
    contentRoot: {
      display: 'block',
      padding: '8px 16px 0px 0px',
    },
    subTitle: {
      alignSelf: 'center',
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      padding: '4px 3px',
    },
    title: {
      fontSize: '16px',
    },
    mainTitle: {},
  });

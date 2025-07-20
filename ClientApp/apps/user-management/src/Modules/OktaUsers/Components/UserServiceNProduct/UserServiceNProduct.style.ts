import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    serviceNProduct: {
      display: 'flex',
      padding: 10,
      alignItems: 'center',
      border: '1px solid #cbcdd5',
      marginBottom: 10,
      borderRadius: 4,
      justifyContent: 'space-around',
    },
    detailList: {
      display: 'flex',
      flexWrap: 'wrap',
      '& .MuiPaper-root': {
        flexBasis: '25%',
        paddingRight: '24px',
        textOverflow: 'ellipsis',
        paddingBottom: '45px',
        '& > div:first-child': {
          display: 'flex',
        },
      },
      '& .MuiButtonBase-root': {
        padding: 0,
      },
      '& .MuiAccordionSummary-root': {
        padding: '0 15px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        width: '100%',
        minHeight: 38,
      },
      '& .MuiAccordionSummary-content':{
        margin: 0,
      },
      '& h6': {
        fontWeight: 100,
        color: palette.grey.A700,
        fontSize: 14,
      },
    },
    detailText: {
      width: '100%',
      padding: '5px 10px',
      border: '1px solid #cbcdd5',
      marginBottom: 10,
    },
    noServices: {
      display: 'flex',
      justifyContent: 'center',
    },
    mainHeading: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: palette.grey.A700,
      marginBottom: 15,
    },
  });

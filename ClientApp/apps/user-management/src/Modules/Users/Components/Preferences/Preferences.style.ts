import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    selectInput: {
      height: 80,
      overflow: 'hidden',
      flexBasis: '25%',
      whiteSpace: 'nowrap',
      paddingRight: 24,
      textOverflow: 'ellipsis',
      paddingBottom: 0,
      '& div.MuiSelect-select': {
        height: 40,
        paddingTop: 9,
        color: palette.grey.A700,
        fontSize: 12,
      },
      '& input': {
        height: 40,
        fontSize: 12,
        color: palette.grey.A700,
      },
    },
    checkboxSection: {
      marginBottom: 15,
      '& .MuiFormControlLabel-label': {
        fontWeight: 600,
        color: palette.grey.A700,
        fontSize: 12,
      },
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
      '& h6': {
        fontWeight: 600,
        color: palette.grey.A700,
        fontSize: 12,
      },
    },
  });

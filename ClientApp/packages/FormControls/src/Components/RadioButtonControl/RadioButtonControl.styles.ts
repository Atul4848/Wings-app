import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    fieldsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      marginRight: 150,
    },
    labelRoot: {
      fontSize: theme.spacing(2),
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      lineHeight: 1.58,
      paddingRight: '3px',
    },
    radioInputRoot: {
      minWidth: 80,
      '& [class*="Mui-disabled"]': {
        backgroundColor: '#EDEDED',
      },
    },
  });

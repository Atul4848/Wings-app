import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      paddingTop: '4px',
    },
    menuItem: {
      minHeight: 30,
    },
    label: {
      marginRight: 150,
    },
    labelRoot: {
      fontSize: '12px',
      fontWeight: 600,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      lineHeight: 1.58,
      paddingRight: '3px',
      '& [class*="MuiFormLabel-asterisk"]': {
        color: 'red',
        fontWeight: 600,
      },
    },
    selectInputRoot: {
      minWidth: 80,
      '& [class*="Mui-disabled"]': {
        backgroundColor: '#EDEDED',
      },
    },
  });

import { Theme, createStyles } from '@material-ui/core/styles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      minWidth: 120,
    },
    inputWrapper: {
      display: 'flex',
    },
    inputRoot: {
      '&&[class*="MuiOutlinedInput-root"]': {
        padding: 0,
      },
      '& [class*="MuiAutocomplete-input"]': {
        marginRight: '14px',
      },
      '&.Mui-disabled': {
        backgroundColor: (theme.palette as any).form?.backgroundColor.disabled,
        '& .MuiIconButton-root.Mui-disabled': {
          color: theme.palette.grey[500],
        },
      },
    },
    multiple: {
      '&&[class*="MuiOutlinedInput-root"]': {
        padding: 3,
        paddingTop: 3,
      },
    },
    option: {
      width: '100%',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    textRoot: {
      '& [class*="MuiFormLabel-root"]': {
        fontSize: '12px',
        '& [class*="MuiFormLabel-asterisk"]': {
          color: 'red',
          fontWeight: 600,
        },
      },
      '& [class*="Mui-disabled"]': {
        opacity: 1,
      },
      '& label.Mui-required:has(div)': {
        '& span.MuiInputLabel-asterisk': {
          display: 'none',
        },
      },
      '& label.Mui-required div': {
        '& span::after': {
          content: '"*"',
          color: 'red',
          fontWeight: 600,
        },
      },
    },
    chip: {
      minWidth: 40,
      maxHeight: 30,
      marginRight: theme.spacing(0.5),
      padding: `${theme.spacing(1)}px !important`,
      '& .MuiChip-deleteIcon': {
        display: 'none',
      },
      '&:hover': {
        '& .MuiChip-deleteIcon': {
          display: 'block',
        },
      },
    },
    inActiveText: {
      color: theme.palette.error.main,
    },
    popper:{
      '& ul':{
        pointerEvents: 'unset !important',
      },
    },
  });

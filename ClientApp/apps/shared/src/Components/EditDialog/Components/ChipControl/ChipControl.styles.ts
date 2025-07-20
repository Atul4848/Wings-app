import { createStyles, Theme } from '@material-ui/core';

export const ChipControlStyles = ({ spacing }: Theme) =>
  createStyles({
    autoCompleteInputRoot: {
      '&&[class*="MuiOutlinedInput-root"]': {
        padding: 3,
        paddingTop: '3px',
      },
      '& [class*="MuiAutocomplete-input"]': {
        marginRight: '14px',
      },
    },
    chip: {
      minWidth: 40,
      maxHeight: 20,
      marginRight: spacing(0.5),
      padding: spacing(1),
      '& .MuiChip-deleteIcon': {
        display: 'none',
      },
      '&:hover': {
        '& .MuiChip-deleteIcon': {
          display: 'block',
        },
      },
    },
  });

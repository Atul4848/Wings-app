import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const formSelectOverrides = ({
  palette,
}: Theme): ComponentsOverrides['MuiSelect'] => ({
  outlined: {
    borderRadius: 4,
    paddingTop: '3px',
  },
  select: {
    paddingTop: 3,
    paddingLeft: 10,
    paddingBottom: 3,
    flexWrap: 'wrap',
    rowGap: '5px',
    
    '&.MuiSelect-select.MuiSelect-outlined': {
      padding: '3px 32px 3px 10px',
      minHeight: '40px !important',
      display: 'inline-flex',
      rowGap: 5,
      overflow: 'hidden',
      flexWrap: 'wrap',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      boxSizing: 'border-box',
    },

    '& .MuiChip-root': {
      marginLeft: -7,
      marginRight: 12,
    },
    '&:focus': {
      borderRadius: 4,
      backgroundColor: palette?.form?.backgroundColor?.focused,
    },
  },
  icon: {
    fill: palette?.icon?.default?.default,
  },
  iconOpen: {
    fill: palette?.icon?.default?.active,
  },
});

import { Theme } from '@mui/material/styles';

// styles/menuItemStyles.ts
export const getMenuItemStyle = (palette: Theme['palette']) => ({
  minHeight: '40px !important',
  borderTop: `0.5px solid ${palette?.menuItem?.borderColor?.default}`,
  background: palette?.menuItem?.backgroundColor?.default,
  color: palette?.menuItem?.textColor?.default,
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 12,
  fontSize: 13,
  justifyContent: 'flex-start',

  '& .MuiListItemText-root': {
    fontSize: 16,
  },

  '&:first-child': {
    borderTop: '0',
  },

  '& > a': {
    color: 'inherit',
    padding: '10px 12px 10px 0px',
  },

  '&:hover': {
    background: palette?.menuItem?.backgroundColor?.hovered,
  },

  '&.Mui-selected, &.Mui-selected:hover': {
    background: palette?.menuItem?.backgroundColor?.active,
    color: `${palette?.menuItem?.textColor?.active} !important`,
  },

  '&.Mui-selected.Mui-disabled': {
    opacity: 0.25,
    backgroundColor: palette?.menuItem?.backgroundColor?.default,
    color: `${palette?.menuItem?.textColor?.default} !important`,
  },

  '&.Mui-focusVisible:not(.Mui-selected)': {
    background: palette?.menuItem?.backgroundColor?.hovered,
  },
});

import { styled } from '@mui/material/styles';

export const SidebarRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  '&>div:first-child': {
    height: '100%',
  },
}));

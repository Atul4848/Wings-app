import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { StyledComponent } from '@emotion/styled';
import { Box, BoxProps } from '@mui/material';

export const DrawerPaper: StyledComponent<BoxProps> = styled(Box)(
  ({ theme }) => ({
    width: '100%',
    overflowY: 'hidden',
  })
);

export const InfoPaneContainer: StyledComponent<BoxProps> = styled(Box)(
  ({ theme }) => ({
    display: 'block',
    flex: 1,
    width: '100%',
    height: '200px',
    padding: 10,
    paddingTop: 0,
    backgroundColor: theme.palette.background.paper,
    flexDirection: 'column',
    alignItems: 'center',
  })
);

export const Header: StyledComponent<BoxProps> = styled(Box)(({ theme }) => ({
  width: '100%',
  maxHeight: 40,
  display: 'flex',
  borderTop: '2px solid',
  borderTopColor: theme.palette.divider,
  flexDirection: 'row',
  flex: 0,
}));

export const Dragger: StyledComponent<BoxProps> = styled(Box)(
  ({ theme }) => ({
    width: '100%',
    cursor: 'row-resize',
    padding: '4px 0 0',
    maxHeight: '50px',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
  })
);

export const IconBtn: StyledComponent<IconButtonProps> = styled(IconButton)<
  IconButtonProps
>(({ theme }) => ({
  display: 'flex',
  flex: 0,
  width: 50,
  justifyContent: 'center',
  alignItems: 'center',
}));

export const InfoContainer: StyledComponent<BoxProps> = styled(Box)(
  ({ theme }) => ({
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    paddingBottom: 40,
    width: '100%',
    borderTop: '2px solid',
    borderTopColor: theme.palette.divider,
  })
);

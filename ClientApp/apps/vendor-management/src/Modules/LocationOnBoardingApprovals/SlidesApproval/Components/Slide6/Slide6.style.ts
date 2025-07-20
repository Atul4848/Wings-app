import { createStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  toggle:{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
    '& p':{
      fontSize: '14px',
      fontWeight: 400
    }
  },
  heading:{
    fontWeight: 600,
    fontSize: '14px',
    paddingBottom: '12px'
  }
}));

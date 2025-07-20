import { createStyles, Theme } from '@material-ui/core';

export const styles = createStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
  },
  innerGrid: {
    margin: '10px',
    boxShadow: '0px 2px 3px 0px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  primaryButton: {
    '& button': {
      background: '#1976D2',
      color: '#fff',
      minWidth: '100px',
      height: '40px'
    },
  },
  box:{
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'start',
    border: '#F1F1F1 solid 1px',
    height: '62px',
    gap: '12px',
    padding: '16px',
    background: '#F1F1F1',
    borderRadius: '8px',
  },
  heading:{
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '26px',
    marginBottom: '20px'
  }
}));

import { createStyles, Theme } from '@material-ui/core';
import { colors, spacing } from 'material-ui/styles';

export const styles = createStyles((theme: Theme) => ({
  editorWrapperContainer: {
    overflow: 'auto',
    '& ul':{
      padding: '0',
      listStyle: 'none',
      '& li':{
        marginBottom: theme.spacing(2),
      },
      '& .onboardingCheckbox':{
        '& .MuiCheckbox-root.Mui-checked':{
          backgroundColor:'#D3D3D3 !important',
          border:'none'
        },
        '& svg':{
          color: '#AFAFAF !important'
        }
      },
      '& .onboardingCheckbox .Mui-disabled':{
        color: 'unset'
      }
    },
    '& li h6':{
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 2,
    }
  },
  
}));

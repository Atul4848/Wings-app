import { makeStyles } from '@material-ui/core/styles';

export const useAccessTypeRendererClasses = makeStyles(() => {
  return {
    root: {
      lineHeight: '21px',
    },
    label: {
      display: 'inline-flex',
      width: 36,
    },
    '@global': {
      '.ag-react-container': {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      },
    }
  };
});
import { makeStyles, Theme } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  mainContent: {
    width: '100%',
    height: '100%',
    '& + div > div': {
      width: '80%',
      maxWidth: '80%',
      wordWrap: 'break-word',
    },
  },

  tabPanel: {
    padding: 0,
    height: '100%',
  },
}));

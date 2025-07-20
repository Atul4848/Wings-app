import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles(({ palette }: Theme) => ({
  mainContainer: {
    display: 'flex',
  },
  textBox: {
    width: '100%',
    border: '1px solid #ddd',
    resize: 'none',
    outline: 'none',
  },
  boxSection: {
    width: '50%',
    margin: '24px',
    padding: '24px',
    backgroundColor: palette.background.paper,
  },
  executeRuleBtn: {
    display: 'flex',
    marginTop: '16px',
    marginRight: '16px',
  },
}));

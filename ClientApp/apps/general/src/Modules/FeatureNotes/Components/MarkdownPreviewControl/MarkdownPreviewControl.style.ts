import { createStyles, Theme } from '@material-ui/core/styles';
export const styles = (theme: Theme) =>
  createStyles({
    reactMarkdown: {
      '& tr': {
        borderTop: '1px solid #c6cbd1',
        background: '#fff',
      },
      '& th, td': {
        padding: '6px 13px',
        border: '1px solid #dfe2e5',
      },
    },
  });

import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ palette }: Theme) =>
  createStyles({
    mainContainer: {
      display: 'flex',
    },
    textBox: {
      width: '100%',
      height: 400,
      border: '1px solid #ddd',
      resize: 'none',
      outline: 'none',
      overflowY: 'auto',
    },
    heading: {
      marginBottom: '10px',
      fontSize: '14px',
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '10px',
    },
    btnAlign: {
      marginLeft: '15px',
    },
    previewEditor: {
      height: 'calc(100vh - 245px)',
      '& div.ql-editor': {
        minHeight: '100%',
      },
    },
    boxSection: {
      backgroundColor: palette.background.paper,
      width: '40%',
      marginRight: '15px',
      padding: '15px',
      '&:last-child': {
        marginRight: 0,
        width: '60%',
      },
    },
    boxSectionTitle: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    testDataSection: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    testDataBtn: {
      height: '22px',
      cursor: 'pointer',
    },
    previewSubject: {
      height: '22px',
      marginBottom: '10px',
      fontSize: '14px',
      fontWeight: 700,
    },
  });

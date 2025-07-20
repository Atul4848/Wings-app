import { Theme, createStyles, makeStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    customHeight: {
      height: 'calc(100vh - 200px)',
    },
    editorWrapperContainerPPRNotes: {
      padding: '24px',
    },
    drawer: {
      backgroundColor: 'rgba(25, 27, 28, 0.06)',
    },
    icons: {
      width: '20px',
      height: '20px',
    },
    accordianDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    rejectionRemarks: {
      color: '#DB063B',
      fontWeight: 700,
      fontSize: '16px',
    },
    accordianSummary: {
      padding: '0px !important',
    },
    nonExpandedIcon: {
      '& .MuiAccordionSummary-expandIcon': {
        background: 'none',
      },
      '& .MuiIconButton-root':{
        padding: '0px !important',
      }
    },
    dialogPaper:{
      '& .MuiDialog-paper':{
        width: '800px !important'
      }
    }
  });

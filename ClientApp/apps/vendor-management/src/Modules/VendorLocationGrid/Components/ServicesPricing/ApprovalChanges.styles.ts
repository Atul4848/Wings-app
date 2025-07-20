import { createStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    root:{
      overflow:'inherit'
    },
    container:{
      padding:0,
      borderRadius:0,
      height:'auto',
      backgroundColor:'transparent',
      boxShadow:'none',
      '& .collapseExpandContainer':{
        padding:theme.spacing(2),
        borderRadius:theme.spacing(2),
        height:'auto',
        marginBottom:theme.spacing(2),
        backgroundColor:theme.palette.background.paper,
        boxShadow:'0px 5px 15px -9px rgba(0,0,0,0.2)',
        '& .rejectionCommentWapper':{
          marginTop:'20px',
        },
        '& .commentTitle':{
          fontSize:'1rem'
        },
        '& .userCommentMessage':{
          fontSize:'1.2rem'
        },
        '& .MuiAccordionSummary-content':{
          display:'flex',
          alignItems:'center',
          fontWeight:'600'
        },
        '& .rejectedText':{
          color:'#db063b',
          textTransform:'uppercase',
          marginLeft:'20px',
          cursor:'default'
        }
      },
    },
    headerActions: {
      justifyContent: 'space-between',
      '& button':{
        backgroundColor:'#005295!important',
        color:'#ffffff',
        '&:hover':{
          backgroundColor:'#003968!important'
        }
      },
      '& .MuiTypography-h6':{
        width: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordWrap: 'normal',
        whiteSpace: 'nowrap'
      },
      '& .inner-header button':{
        backgroundColor:'inherit!important',
        color:'#1976d2',
        '&:hover':{
          border: '1px solid #1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.04)!important'
        }
      }
    },
    editorWrapperContainer: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    customHeight: {
      height: 'calc(100vh - 280px)',
    },
    gridHeight:{
      paddingBottom:'0'
    },
    headerCustomButtons:{
      textAlign:'right',
      marginBottom:'10px',
      '& a, & button':{
        marginLeft:'10px'
      } 
    },
    approvalchangesHeader:{
      borderBottom:'1px solid #929292',
      paddingBottom:'10px',
      marginBottom:'20px'
    },
    panelActionButtons:{
      float:'right',
    },
    noRecordsFound:{
      backgroundColor: theme.palette.background.paper,
      height:'70vh',
      textAlign:'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dialogeWrapper:{
      border:'1px solid red',
      '& .userCommentArea':{
        width:'100%',
        minHeight:'40px',
        backgroundColor: theme.palette.background.paper,
        borderRadius:'5px',
        padding:theme.spacing
      }
    }
  });

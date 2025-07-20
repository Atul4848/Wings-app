import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  mapBoxViewWrapper:{
    position:'relative',
    '& #search-box input[type="text"]':{
      backgroundColor: '#fff',
      color: 'rgba(0, 0, 0, 0.75)',
      boxShadow:'0 0 10px 2px rgba(0, 0, 0, 0.05)',
      whiteSpace:'nowrap',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      width:'300px'
    },
    '& #search-results':{
      backgroundColor: '#fff',
      color: 'rgba(0, 0, 0, 0.75)',
      boxShadow:'0 0 10px 2px rgba(0, 0, 0, 0.05)',
      borderRadius: '5px',
    },
    '& #search-results div':{
      padding:'10px',
      cursor:'pointer'
    },
    '& #search-results div:hover':{
      backgroundColor:'rgba(0, 0, 0, 0.05)'
    }
  }
}));

export const fields = {
  
  icao: {
    label: 'Icao*',
    rules: 'required|between:3,4',
  },
  navblueCode: {
    label: 'Navblue Code*',
    rules: 'required|between:0,4',
  },
  apgCode: {
    label: 'APG Code',
    rules: 'between:0,4',
  },
};
  
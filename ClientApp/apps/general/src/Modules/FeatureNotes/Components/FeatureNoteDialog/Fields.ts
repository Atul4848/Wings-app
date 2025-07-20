export const fields = {
  startDate: {
    label: 'Start Date*',
    rules: 'required',
  },
  title: {
    label: 'Title*',
    rules: 'required|string|between:1,200',
  },
  category: {
    label: 'Category*',
    rules: 'required',
  },
  isInternal: {
    label: 'Is Internal',
  },
};

export const fields = {
  contact: {
    label: 'Contact*',
    rules: 'required',
    placeholder: 'Select contact',
  },
  categoryEventType: {
    label: 'Category Event Type*',
    rules: 'required',
    placeholder: 'Select Type',
  },
  category: {
    label: 'Category',
    rules: 'required',
    placeholder: 'Category',
  },
  subCategory: {
    label: 'Sub Category',
    placeholder: 'Sub Category',
  },
  eventType: {
    label: 'Event Type',
    rules: 'required',
    placeholder: 'Event Type',
  },
  isEnabled: {
    label: 'Is Enabled',
  },
  filter: {
    label: 'Filters',
    rules: 'string|between:1,1000',
  },
};
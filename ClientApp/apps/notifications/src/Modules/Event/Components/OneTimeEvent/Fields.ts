export const fields = {
  eventType: {
    label: 'Event Type*',
    rules: 'required',
  },
  triggerTime: {
    label: 'Trigger Time',
  },
  level: {
    label: 'Message Level*',
    rules: 'required',
  },
  content: {
    label: 'Content*',
    rules: 'required',
  },
  subject: {
    label: 'Subject*',
    rules: 'required|string|between:1,200',
  },
};

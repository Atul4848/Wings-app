export const fields = {
  startTime: {
    fields: {
      time: {
        label: 'Start Time',
        placeholder: 'Select Start Time',
      },
      solarTime: {
        label: 'Sunset/ Sunrise*',
        rules: 'required',
        placeholder: 'Select Sunset/ Sunrise',
      },
      offSet: {
        label: 'Start Offset (minutes)',
        rules: 'integer',
        placeholder: 'Start Offset (minutes)',
      },
    },
  },
  endTime: {
    fields: {
      time: {
        label: 'End Time',
        placeholder: 'Select End Time',
      },
      solarTime: {
        label: 'Sunset/ Sunrise*',
        rules: 'required',
        placeholder: 'Select Sunset/ Sunrise',
      },
      offSet: {
        label: 'End Offset (minutes)',
        rules: 'integer',
        placeholder: 'End Offset (minutes)',
      },
    },
  },
  durationInMinutes: {
    label: 'Duration (minutes)',
    rules: 'integer',
    placeholder: '0',
  },
  is24Hours: {
    label: 'Is 24 Hours',
  },
};

export const fields = [
  'stageEvents',
  'stageEvents[].name',
  'stageEvents[].startDate',
  'stageEvents[].endDate',
  'stageEvents[].hotelShortage',
];

export const placeholders = {
  'stageEvents[].name': 'Event Name',
  'stageEvents[].startDate': 'Event Start Date',
  'stageEvents[].endDate': 'Event End Date',
  'stageEvents[].hotelShortage': 'Hotel Shortage',
};

export const rules = {
  'stageEvents[].name': 'string|required',
  'stageEvents[].startDate': 'string|required',
  'stageEvents[].endDate': 'string|required',
  'stageEvents[].hotelShortage': 'string|required',
};

export const options = {
  'stageEvents[].hotelShortage': [ 'Yes, definitely', 'Potentially', 'No' ],
};

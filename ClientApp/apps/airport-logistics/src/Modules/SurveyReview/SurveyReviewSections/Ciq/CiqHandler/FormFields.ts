export const fields = [
  'privateFBOOperatingHours',
  'privateFBOOperatingHours.operatingHours',
  'privateFBOOperatingHours.operatingHours[].id',
  'privateFBOOperatingHours.operatingHours[].day',
  'privateFBOOperatingHours.operatingHours[].timeFrom',
  'privateFBOOperatingHours.operatingHours[].timeTo',
  'ciqHoursForGATOrFBO',
  'ciqHoursForGATOrFBO.operatingHours',
  'ciqHoursForGATOrFBO.operatingHours[].id',
  'ciqHoursForGATOrFBO.operatingHours[].day',
  'ciqHoursForGATOrFBO.operatingHours[].timeFrom',
  'ciqHoursForGATOrFBO.operatingHours[].timeTo',
];

export const placeholders = {
  'privateFBOOperatingHours.operatingHours[].timeFrom': 'HH:mm',
  'privateFBOOperatingHours.operatingHours[].timeTo': 'HH:mm',
  'ciqHoursForGATOrFBO.operatingHours[].timeFrom': 'HH:mm',
  'ciqHoursForGATOrFBO.operatingHours[].timeTo': 'HH:mm',
}

export const rules = {
  'privateFBOOperatingHours.operatingHours[].timeFrom': 'required|string',
  'privateFBOOperatingHours.operatingHours[].timeTo': 'required|string',
  'ciqHoursForGATOrFBO.operatingHours[].timeFrom': 'required|string',
  'ciqHoursForGATOrFBO.operatingHours[].timeTo': 'required|string',
}

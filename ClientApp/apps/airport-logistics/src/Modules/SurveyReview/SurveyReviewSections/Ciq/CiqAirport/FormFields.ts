const vipTerminalUsageOptions = [
  'Per person, per use (arrival or departure)',
  'Per facility use (regardless of pax count)',
];

const timeFieldRules = 'string|min:5|max:5';

export const fields = [
  'advanceNoticePair',
  'advanceNoticePair.value',
  'advanceNoticePair.unit',
  'airportFacilities', // checkboxes
  'crewPaxOnBoardCustomsClearance', // radio
  'genDecAdditionalProcedures', // checkboxes
  'genDecAssistanceRequired', // radio
  'genDecFilePath', // string
  'genDecRequired', // radio
  'specificGenDecTypeRequired', // radio
  'generalAviationTerminal',
  'generalAviationTerminal.ciqAvailable',
  'generalAviationTerminal.costPair',
  'generalAviationTerminal.limitedHoursPossible',
  'generalAviationTerminal.operatingHours',
  'generalAviationTerminal.operatingHours[].id',
  'generalAviationTerminal.operatingHours[].day',
  'generalAviationTerminal.operatingHours[].timeFrom',
  'generalAviationTerminal.operatingHours[].timeTo',
  'mainTerminal',
  'mainTerminal.ciqRequired',
  'mainTerminal.crewPaxPriority',
  'mainTerminal.crewPaxPriorityExplanation',
  'mainTerminal.operatingHours[].timeFrom',
  'mainTerminal.operatingHours[].timeTo',
  'ciqMainTerminal',
  'ciqMainTerminal.subComponentId',
  'ciqMainTerminal.ciqOvertimeRequired',
  'ciqMainTerminal.operatingHours[].timeFrom',
  'ciqMainTerminal.operatingHours[].timeTo',
  'specificGenDecTypeRequired',
  'vipAreaTerminal',
  'vipAreaTerminal.feeType',
  'vipAreaTerminal.usageCostPair',
  'vipAreaTerminal.usageCostPair.value',
  'vipAreaTerminal.usageCostPair.unit',
  'vipAreaTerminal.overTimeCostPair',
  'vipAreaTerminal.overTimeCostPair.value',
  'vipAreaTerminal.overTimeCostPair.unit',
  'vipAreaTerminal.operatingHours[].timeFrom',
  'vipAreaTerminal.operatingHours[].timeTo',
];

export const placeholders = {
  'genDecFilePath': 'Gendec File Path',
  'generalAviationTerminal.availableForGATFBO': 'Available for GAT FBO',
  'generalAviationTerminal.cost': 'GAT Cost in Numbers',
  'generalAviationTerminal.costType': 'GAT Cost Type',
  'advanceNoticePair.value': 'Advance Notice on Board Customs Crew Pax Clearance',
  'advanceNoticePair.unit': 'Select Unit',
  'vipAreaTerminal.feeType': 'Fee Type',
  'vipAreaTerminal.usageCostPair.value': 'Usage Cost in numbers',
  'vipAreaTerminal.usageCostPair.unit': 'Select Type',
  'vipAreaTerminal.overTimeCostPair.value': 'Over Time Cost in numbers',
  'vipAreaTerminal.overTimeCostPair.unit': 'Select Type',
  'vipAreaTerminal.overtimePossible': 'Over Time Possible',
  'generalAviationTerminal.costPair.value': 'GAT Cost in numbers',
  'generalAviationTerminal.costPair.unit': 'Select Type',
  'mainTerminal.operatingHours[].timeFrom': 'HH:mm',
  'mainTerminal.operatingHours[].timeTo': 'HH:mm',
  'generalAviationTerminal.operatingHours[].timeFrom': 'HH:mm',
  'generalAviationTerminal.operatingHours[].timeTo': 'HH:mm',
  'vipAreaTerminal.operatingHours[].timeFrom': 'HH:mm',
  'vipAreaTerminal.operatingHours[].timeTo': 'HH:mm',
  'ciqMainTerminal.operatingHours[].timeFrom': 'HH:mm',
  'ciqMainTerminal.operatingHours[].timeTo': 'HH:mm',
}

export const labels = {
  'genDecFilePath': 'Gendec File Path',
  'generalAviationTerminal.availableForGATFBO': 'Available for GAT FBO',
  'generalAviationTerminal.cost': 'GAT Cost in Numbers',
  'generalAviationTerminal.costType': 'GAT Cost Type',
  'advanceNoticePair.value': 'Advance Notice on Board Customs Crew Pax Clearance',
  'advanceNoticePair.unit': 'Select Unit',
  'vipAreaTerminal.usageCostPair.value': 'Usage Cost in numbers',
  'vipAreaTerminal.usageCostPair.unit': 'Select Type',
  'vipAreaTerminal.overTimeCostPair.value': 'Over Time Cost in numbers',
  'vipAreaTerminal.overTimeCostPair.unit': 'Select Type',
  'generalAviationTerminal.costPair.value': 'GAT Cost in numbers',
  'generalAviationTerminal.costPair.unit': 'Select Type',
}

export const rules = {
  'genDecFilePath': 'string',
  'advanceNoticePair.value': 'required|numeric|min:1|max:999999',
  'advanceNoticePair.unit': 'required|string',
  'vipAreaTerminal.usageCostPair.value': 'numeric|min:1|max:99999',
  'vipAreaTerminal.usageCostPair.unit': 'string',
  'vipAreaTerminal.overTimeCostPair.value': 'numeric|min:1|max:99999',
  'vipAreaTerminal.overTimeCostPair.unit': 'required',
  'generalAviationTerminal.costPair.value': 'numeric|min:1|max:99999',
  'generalAviationTerminal.costPair.unit': 'required',
  'vipAreaTerminal.operatingHours[].timeFrom': timeFieldRules,
  'vipAreaTerminal.operatingHours[].timeTo': timeFieldRules,
  'ciqMainTerminal.operatingHours[].timeFrom': timeFieldRules,
  'ciqMainTerminal.operatingHours[].timeTo': timeFieldRules,
  'mainTerminal.operatingHours[].timeFrom': timeFieldRules,
  'mainTerminal.operatingHours[].timeTo': timeFieldRules,
  'generalAviationTerminal.operatingHours[].timeFrom': timeFieldRules,
  'generalAviationTerminal.operatingHours[].timeTo': timeFieldRules,
}

export const options = {
  'specificGenDecTypeRequired': [ 'Yes', 'No' ],
  'genDecRequired': [ 'Yes', 'No' ],
  'genDecAssistanceRequired': [ 'Yes', 'No' ],
  'crewPaxOnBoardCustomsClearance': [ 'Yes', 'No' ],
  'advanceNoticePair.unit': [ 'Hours', 'Days', 'Weeks' ],
  'mainTerminal.ciqRequired': [
    'No, CIQ is available all times the Main Terminal is Open',
    'Yes, they have limited hours.',
    'N/A',
  ],
  'ciqMainTerminal.ciqOvertimeRequired': [ 'Yes', 'No' ],
  'vipAreaTerminal.overtimePossible': [ 'Yes', 'No', 'N/A' ],
  'vipAreaTerminal.usageCostPair.unit': vipTerminalUsageOptions,
  'vipAreaTerminal.overTimeCostPair.unit': vipTerminalUsageOptions,
  'generalAviationTerminal.ciqAvailable': [ 'Yes', 'No' ],
  'generalAviationTerminal.limitedHoursPossible': [
    'Yes, they have limited hours.',
    'No, CIQ is available all times the VIP/GAT/FBO is open',
  ],
  'generalAviationTerminal.costPair.unit': vipTerminalUsageOptions,
  'mainTerminal.crewPaxPriority': [ 'Yes', 'No', 'Sometimes' ],
}

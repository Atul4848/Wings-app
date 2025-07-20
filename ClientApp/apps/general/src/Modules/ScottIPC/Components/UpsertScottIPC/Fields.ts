import { regex } from '@wings-shared/core';

export const fields = {
  uwaAccountNumber: {
    label: 'UWA Customer Number*',
    rules: `required|regex:${regex.numeric}`,
  },
  sipcUserId: {
    label: 'Scott IPC User ID*',
    rules: `required|regex:${regex.numeric}`,
  },
  sipcName: {
    label: 'Scott IPC Name*',
    rules: `required|regex:${regex.alphabetsWithSpaces}`,
  },
  captainName: {
    label: 'Captain Name',
    rules: `regex:${regex.alphabetsWithSpaces}`,
  },
  crewPaxId: {
    label: 'CAPPS Person ID',
    rules: `regex:${regex.numbersWithEmpty}`,
  },
};

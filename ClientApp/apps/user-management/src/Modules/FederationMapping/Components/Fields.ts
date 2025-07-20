export const fields = {
  customerNumber: {
    label: 'Customer Number',
    rules: 'required|numeric|between:0,9999999999',
  },
  identityProvider: {
    label: 'Identity Provider',
    rules: 'required|string|between:0,100',
  },
  clientId: {
    label: 'ClientId',
    rules: 'required|numeric|between:1,999999999',
  },
};

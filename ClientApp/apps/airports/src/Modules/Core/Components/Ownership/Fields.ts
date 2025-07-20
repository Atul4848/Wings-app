/* istanbul ignore next */
export const fields = {
  airportManagerName: {
    label: 'Airport Manager Name',
    rules: 'string|max:200',
  },
  airportManagerAddress: {
    fields: {
      addressLine1: {
        label: 'Address I',
        rules: 'string|max:80',
      },
      addressLine2: {
        label: 'Address II',
        rules: 'string|max:40',
      },
      city: {
        label: 'City',
      },
      state: {
        label: 'State',
      },
      country: {
        label: 'Country',
      },
      zipCode: {
        label: 'Zipcode',
        rules: 'string|max:20',
      },
      email: {
        label: 'Email',
        rules: 'string|email|max: 200',
      },
      phone: {
        label: 'Phone',
        rules: 'string|between:0,25',
      },
    },
  },
  airportOwnerName: {
    label: 'Airport Owner\'s Name',
    rules: 'string|max:200',
  },
  airportOwnerAddress: {
    fields: {
      addressLine1: {
        label: 'Address I',
        rules: 'string|max:80',
      },
      addressLine2: {
        label: 'Address II',
        rules: 'string|max:40',
      },
      city: {
        label: 'City',
      },
      state: {
        label: 'State',
      },
      country: {
        label: 'Country',
      },
      zipCode: {
        label: 'Zipcode',
        rules: 'string|max:20',
      },
      email: {
        label: 'Email',
        rules: 'string|email|max: 200',
      },
      phone: {
        label: 'Phone',
        rules: 'string|between:0,25',
      },
    },
  },
};

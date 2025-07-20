export enum CUSTOMER_COMMS_FILTER {
  CONTACT_METHOD = 'ContactMethod',
  CONTACT_TYPE = 'ContactType',
  CONTACT = 'Contact',
  CONTACT_NAME = 'ContactName',
  CONTACT_ROLE = 'ContactRole',
  CONTACT_LEVEL = 'ContactLevel',
  CUSTOMER = 'Customer',
  SITE = 'Site',
  OFFICE = 'Office',
  OPERTAOR = 'Operator',
  REGISTRY = 'Registry',
  COMMUNICATION_CATEGORIES = 'CommunicationCategories',
  START_DATE = 'StartDate',
  END_DATE = 'EndDate',
}

export enum CUSTOMER_COMMS_FILTER_BY {
  CONTACT = 'Contact',
  CONTACT_NAME = 'Contact Name',
  CUSTOMER = 'Customer',
  SITE = 'Site',
  OFFICE = 'Office',
  OPERATOR = 'Operator',
  REGISTRY = 'Registry',
  CUSTOMER_OFFICE = 'CustomerOffice',
  CUSTOMER_REGISTRY = 'CustomerRegistry',
}

export enum CONTACT_OPTIONS {
  LINK_EXISTING_CONTACT = 'Link Existing Contact',
  NEW_CONTACT = 'New Contact',
}

export enum CUSTOMER_CONTACT_FILTERS {
  CONTACT = 'Contact',
  CONTACT_EXTENSION = 'Contact Extension',
  CONTACT_NAME = 'Contact Name',
  CONTACT_METHOD = 'Contact Method',
  CONTACT_TYPE = 'Contact Type',
}

export enum CUSTOMER_COMMUNICATION_FILTERS {
  COMMUNICATION_LEVEL = 'Communication Level',
  CONTACT_ROLE = 'Contact Role',
  CUSTOMER = 'Customer',
  CUSTOMER_NUMBER = 'Customer Number',
  CONTACT = 'Contact',
  CONTACT_EXTENSION = 'Contact Extension',
  CONTACT_NAME = 'Contact Name',
  CONTACT_METHOD = 'Contact Method',
  CONTACT_TYPE = 'Contact Type',
}

export enum CONTACT_COMMUNICATION_LEVEL {
  CUSTOMER = 1,
  OPERATOR,
  REGISTRY,
  SITE,
  OFFICE,
  CUSTOMER_OFFICE,
  CUSTOMER_REGISTRY,
}

export enum CONTACT_METHOD {
  PHONE = 'phone',
  FAX = 'fax',
  EMAIL = 'email',
}

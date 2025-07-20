import { ROLE_ACCESS_TYPE } from '../../../Shared/Enums';

export function getApiRole ({ values, userRoleId }) {
  const { accessType, customer, registry, role, sites } = values;

  const customerAttribute = customer?.name
    ? { type: 'Customer', value: customer.name }
    : null;

  const customerIdAttribute = customer?.id
    ? { type: 'CustomerId', value: customer.id }
    : null;

  const customerNumberAttribute = customer?.number
    ? { type: 'CustomerNumber', value: customer.number }
    : null;

  const siteAttribute = sites
    ? { type: 'Site', value: sites.number }
    : null;

  const registryAttribute = registry?.name
    ? { type: 'Registry', value: registry.name }
    : null;

  const attributes = [
    customerAttribute,
    customerIdAttribute,
    customerNumberAttribute,
    siteAttribute,
    registryAttribute,
  ].filter(Boolean);

  const apiRole: any = {
    RoleId: role.roleId,
    Attributes: attributes,
    IsTrial: accessType === ROLE_ACCESS_TYPE.TRIAL,
  };

  if (userRoleId) {
    apiRole.UserRoleId = userRoleId;
  }

  if (values.validFrom) {
    apiRole.ValidFrom = values.validFrom;
  }

  if (values.validTo) {
    apiRole.ValidTo = values.validTo;
  }

  return apiRole;
}

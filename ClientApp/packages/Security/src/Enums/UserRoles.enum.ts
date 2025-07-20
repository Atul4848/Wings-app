export enum USER_ACCESS_ROLES {
  UM_READER = 'um_reader', // allows read access to everything apart from the sync troubleshooting
  UM_MANAGER = 'um_manager', // allows write access to most things apart from the sync troubleshooting area
  UM_ADMIN = 'um_admin', // allows access to everything
  UM_GROUP_MANAGER = 'um group_manager', // allows write access to group

  // wings_ref_data_global role and permissions used across the different wings apps
  REF_DATA_ADMIN = 'wg_admin',
  REF_DATA_DM_USER = 'wg_dm_user',
  REF_DATA_SYSTEM_ADMIN = 'wg_system_admin',
  REF_DATA_GLOBAL_USER = 'wg_ops',

  // wings_ref_data_geographic
  GEOGRAPHIC_APP_UA_USER = 'geo_ua_user',
  GEOGRAPHIC_APP_UWA_MARKETING_USER = 'geo_marketing_user',

  // wings_ref_data_aircraft
  AIRCRAFT_FP_ADMIN = 'aircraft_fp_admin',
  AIRCRAFT_FP_DM_USER = 'aircraft_fp_dm_user',

  // wings_ref_data_restrictions
  RESTRICTIONS_QRG_ADMIN = 'restrictions_qrg_admin',
  RESTRICTIONS_QRG_DM_USER = 'restrictions_qrg_dm_user',

  // wings_ref_data_airports
  AIRPORTS_GRS_USER = 'airports_grs_user',
}

// Remote Static App Urls
// NOTE: Keep It Js File as we needs to use in craco config
const appUrls = {
  airports: process.env.REACT_APP_URL_AIRPORTS_APP,
  timeZone: process.env.REACT_APP_URL_TIMEZONE_APP,
  permits: process.env.REACT_APP_URL_PERMIT_APP,
  airportLogistic: process.env.REACT_APP_URL_AIRPORT_LOGISTICS_APP,
  countries: process.env.REACT_APP_URL_COUNTRIES_APP,
  userManagement: process.env.REACT_APP_URL_USER_MANAGEMENT_APP,
  restrictions: process.env.REACT_APP_URL_RESTRICTIONS_APP,
  aircraft: process.env.REACT_APP_URL_AIRCRAFT_APP,
  notifications: process.env.REACT_APP_URL_NOTIFICATIONS_APP,
  general: process.env.REACT_APP_URL_GENERAL_APP,
  vendorManagement: process.env.REACT_APP_URL_VENDOR_MANAGEMENT_APP,
  customer: process.env.REACT_APP_URL_CUSTOMER_APP,
};
module.exports = appUrls;

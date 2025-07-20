import React, { FC, useEffect, ReactNode, useState, useMemo } from 'react';
import { UpsertSettings } from '@wings/shared';
import { SETTING_ID, VmsModuleSecurity } from '../Shared';
import { SettingsStore } from '../../Stores';
import { useStyles } from './VendorSettings.styles';
import { categoryList, settingList } from './Fields';
import { inject, observer } from 'mobx-react';
import { Typography } from '@material-ui/core';
import { IClasses, SelectOption } from '@wings-shared/core';
import ParametersSettings from './Components/ParametersSettings';
import HandlingFeeTypeSettings from './Components/HandlingFeeTypeSettings';
import ServiceCategorySettings from './Components/ServiceCategorySettings';
import UnitSettings from './Components/UnitSettings';
import CurrencySettings from './Components/CurrencySettings';
import ServiceItemNameSettings from './Components/ServiceItemNameSettings';
import { SettingCategoryControl } from '@wings-shared/form-controls';
import ContactMethodSettings from './Components/VendorContacts/ContactMethodSettings';
import ContactTypeSettings from './Components/VendorContacts/ContactTypeSettings';
import ContactStatusSettings from './Components/VendorContacts/ContactStatusSettings';
import CommunicationServiceSettings from './Components/VendorContacts/CommunicationServiceSettings';
import UsageTypeSettings from './Components/VendorContacts/UsageTypeSettings';
import PricingStatusSettings from './Components/VendorPricing/PricingStatusSettings';
import VendorStatusSettings from './Components/Vendors/VendorStatusSettings';
import VendorLocationStatusSettings from './Components/VendorLocations/VendorLocationStatusSettings';
import AddressTypeSettings from './Components/Vendors/AddressTypeSettings';
import DocumentNameSettings from './Components/VendorDocument/DocumentNameSettings';
import DocumentStatusSetting from './Components/VendorDocument/DocumentStatusSetting';
import VendorLevelSetting from './Components/VendorOperationalEssential/VendorLevelSetting';
import CertifiedMemberFeeScheduleSetting from 
  './Components/VendorOperationalEssential/CertifiedMemberFeeScheduleSetting';
import PaymentOptionsSetting from './Components/VendorOperationalEssential/PaymentOptionsSetting';
import CreditAvailableSetting from './Components/VendorOperationalEssential/CreditAvailableSetting';
import MainServicesOfferedSetting from './Components/VendorOperationalEssential/MainServicesOfferedSetting';
import OperationTypeSetting from './Components/VendorOperationalEssential/OperationTypeSetting';
import HoursTypeSettings from './Components/VendorHours/HoursTypeSettings';
import ScheduleTypeSettings from './Components/VendorHours/ScheduleTypeSettings';
import HoursStatusSettings from './Components/VendorHours/HoursStatusSettings';
import AccessLevelSettings from './Components/General/AccessLevelSettings';
import A2gLocationType from './Components/A2GLocation/A2gLocationType';
import DriverLocationCrew from './Components/VendorOperationalInsights/DriverLocationCrew';
import DriverLocationPax from './Components/VendorOperationalInsights/DriverLocationPax';
import Amenities from './Components/VendorOperationalInsights/Amenities';
import AircraftParkingOptions from './Components/VendorOperationalInsights/AircraftParkingOptions';
import AircraftParkingDistanceFBO from './Components/VendorOperationalInsights/AircraftParkingDistanceFBO';
import AircraftSpotAccommodation from './Components/VendorOperationalInsights/AircraftSpotAccommodation';
import TowbarScenarios from './Components/VendorOperationalInsights/TowbarScenarios';
import AvailableFacilities from './Components/VendorOperationalInsights/AvailableFacilities';
import LuggageHandling from './Components/VendorOperationalInsights/LuggageHandling';
import ArrivalCrewPaxPassportHandling from './Components/VendorOperationalInsights/ArrivalCrewPaxPassportHandling';
import DisabilityAccommodations from './Components/VendorOperationalInsights/DisabilityAccommodations';
import HangerAvailableUom from './Components/VendorOperationalInsights/HangerAvailableUom';
import VendorOrderManagement from './Components/VendorOrderManagementSoftware/VendorOrderManagement';
import InternationalDepartureProcedures from './Components/VendorOperationalInsights/InternationalDepartureProcedures';
import InternationalArrivalProcedures from './Components/VendorOperationalInsights/InternationalArrivalProcedures';

interface Props {
  classes?: IClasses;
  settingsStore?: SettingsStore;
}

const VendorSettings: FC<Props> = observer(({ settingsStore }) => {
  const classes = useStyles();
  const [ activeCategory, setActiveCategory ] = useState<number>(1);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(1);

  const handleActiveCategory = (categoryID: number): void => {
    setActiveCategory(categoryID);
  };

  const handleActiveSubCategory = (categoryID: number): void => {
    setActiveSubCategory(categoryID);
  };

  const subCategories = useMemo(() => {
    return settingList
      .filter(setting => setting.categoryId === activeCategory)
      .map(setting => new SelectOption({ name: setting.settingLabel, value: setting.settingId }));
  }, [ activeCategory ]);

  useEffect(() => {
    handleActiveSubCategory(subCategories[0].value as number);
  }, [ subCategories ]);

  const renderSetting = (props: any): ReactNode => {
    switch (activeSubCategory) {
      case SETTING_ID.SETTING_ACCESS_LEVEL:
        return <AccessLevelSettings />;
      case SETTING_ID.STATUS:
        return <VendorStatusSettings />;
      case SETTING_ID.LOCATION_STATUS:
        return <VendorLocationStatusSettings />;
      case SETTING_ID.SETTINGS_PARAMETERS:
        return <ParametersSettings />;
      case SETTING_ID.SETTINGS_UNITS:
        return <UnitSettings />;
      case SETTING_ID.SETTINGS_HANDLING_FEES:
        return <HandlingFeeTypeSettings />;
      case SETTING_ID.SETTINGS_CURRENCY:
        return <CurrencySettings />;
      case SETTING_ID.SETTINGS_SERVICE_ITEM_NAME:
        return <ServiceItemNameSettings />;
      case SETTING_ID.SETTINGS_SERVICE_CATEGORY:
        return <ServiceCategorySettings />;
      case SETTING_ID.SETTINGS_PRICING_STATUS:
        return <PricingStatusSettings />;
      case SETTING_ID.SETTING_CONTACT_METHOD:
        return <ContactMethodSettings />;
      case SETTING_ID.SETTING_CONTACT_TYPE:
        return <ContactTypeSettings />;
      case SETTING_ID.SETTINGS_CONTACT_STATUS:
        return <ContactStatusSettings />;
      case SETTING_ID.SETTING_COMMUNICATION_SERVICE:
        return <CommunicationServiceSettings />;
      case SETTING_ID.SETTING_USAGES_TYPE:
        return <UsageTypeSettings />;
      case SETTING_ID.SETTING_ADDRESS_TYPE:
        return <AddressTypeSettings />;
      case SETTING_ID.SETTING_DOCUMENT_NAME:
        return <DocumentNameSettings />;
      case SETTING_ID.SETTING_DOCUMENT_STATUS:
        return <DocumentStatusSetting />;
      case SETTING_ID.SETTINGS_VENDOR_LEVEL:
        return <VendorLevelSetting />;
      case SETTING_ID.SETTINGS_CERTIFIED_MEMBER_FEE_SCHEDULE:
        return <CertifiedMemberFeeScheduleSetting />;
      case SETTING_ID.SETTINGS_PAYMENTS_OPTIONS:
        return <PaymentOptionsSetting />;
      case SETTING_ID.SETTINGS_CREDIT_AVAILABLE:
        return <CreditAvailableSetting />;
      case SETTING_ID.SETTINGS_MAIN_SERVICE_OFFERED:
        return <MainServicesOfferedSetting />;
      case SETTING_ID.SETTINGS_OPERATON_TYPE:
        return <OperationTypeSetting />;
      case SETTING_ID.SETTINGS_HOURS_TYPE:
        return <HoursTypeSettings />;
      case SETTING_ID.SETTINGS_HOURS_SCHEDULE_TYPE:
        return <ScheduleTypeSettings />;
      case SETTING_ID.SETTINGS_HOURS_STATUS:
        return <HoursStatusSettings />;
      case SETTING_ID.SETTING_A2G_LOCATION_TYPE:
        return <A2gLocationType />;
      case SETTING_ID.SETTING_DRIVER_LOCATION_CREW:
        return <DriverLocationCrew />;
      case SETTING_ID.SETTING_DRIVER_LOCATION_PAX:
        return <DriverLocationPax />;
      case SETTING_ID.SETTING_AMENITIES:
        return <Amenities />;
      case SETTING_ID.SETTING_AIRCRAFT_PARKING_OPTIONS:
        return <AircraftParkingOptions />;
      case SETTING_ID.SETTING_AIRCRAFT_PARKING_DISTANCE_FBO:
        return <AircraftParkingDistanceFBO />;
      case SETTING_ID.SETTING_AIRCRAFT_SPOT_ACCOMMODATION:
        return <AircraftSpotAccommodation />;
      case SETTING_ID.SETTING_TOWBAR_SCENARIOS:
        return <TowbarScenarios />;
      case SETTING_ID.SETTING_INTERNATIONAL_DEPARTURE_PROCEDURES:
        return <InternationalDepartureProcedures/>;
      case SETTING_ID.SETTING_INTERNATIONAL_ARRIVAL_PROCEDURES:
        return <InternationalArrivalProcedures/>;
      case SETTING_ID.SETTING_AVAILABLE_FACILITIES:
        return <AvailableFacilities />;
      case SETTING_ID.SETTING_LUGGAGE_HANDLING:
        return <LuggageHandling />;
      case SETTING_ID.SETTING_ARRIVAL_CREW_PAX_PASSPORT_HANDLING:
        return <ArrivalCrewPaxPassportHandling />;
      case SETTING_ID.SETTING_DISABILITY_ACCOMMODATIONS:
        return <DisabilityAccommodations />;
      case SETTING_ID.SETTING_HANGER_AVAILABLE_UOM:
        return <HangerAvailableUom />;
      case SETTING_ID.SETTING_ORDER_MANAGEMENT_SOFTWARE:
        return <VendorOrderManagement />;
    }
  };

  return (
    <>
      <div className={classes.heading}>
        <Typography component="h3">Vendor Management Settings</Typography>
      </div>
      <div className={classes.root}>
        <div className={classes.selectSettingContainer}>
          <SettingCategoryControl
            title="Setting category"
            value={activeCategory}
            selectOptions={categoryList}
            onOptionChange={category => handleActiveCategory(category)}
          />
          <SettingCategoryControl
            title="Sub category"
            value={activeSubCategory}
            selectOptions={subCategories}
            onOptionChange={settingLabel => handleActiveSubCategory(settingLabel)}
          />
        </div>
        <div className={classes.settingWrapper}>{renderSetting()}</div>
      </div>
    </>
  );
});
export default inject('settingsStore')(VendorSettings);

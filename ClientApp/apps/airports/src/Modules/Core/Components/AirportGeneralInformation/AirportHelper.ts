import { EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';

const { TEXT_FIELD, DROPDOWN } = EDITOR_TYPES;

class AirportHelper {
  codeFields = [
    'icaoCode',
    'uwaAirportCode',
    'regionalAirportCode',
    'iataCode',
    'faaCode',
  ];

  locationFields: string[] = [
    'airportLocation.city',
    'airportLocation.closestCity',
    'airportLocation.island',
  ];

  latDirections = [
    { label: 'N', value: 'N' },
    { label: 'S', value: 'S' },
  ];

  longDirections = [
    { label: 'W', value: 'W' },
    { label: 'E', value: 'E' },
  ];

 longValues = (): IViewInputControl[] => {
   return [
     { fieldKey: 'long', type: TEXT_FIELD },
     { fieldKey: 'min', type: TEXT_FIELD },
     { fieldKey: 'sec', type: TEXT_FIELD },
     { fieldKey: 'dir', type: DROPDOWN, options: this.longDirections },
   ];
 };

 latValues = (): IViewInputControl[] => {
   return [
     { fieldKey: 'lat', type: TEXT_FIELD },
     { fieldKey: 'min', type: TEXT_FIELD },
     { fieldKey: 'sec', type: TEXT_FIELD },
     { fieldKey: 'dir', type: DROPDOWN, options: this.latDirections },
   ];
 };
}

const airportHelper = new AirportHelper();
export default airportHelper;

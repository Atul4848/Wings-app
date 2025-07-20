import { FIELD_TYPE } from '../Enums';

export interface IAPIFieldDefinition {
  Id?: number;
  DisplayName: string;
  VariableName: string;
  Description: string;
  FieldType: FIELD_TYPE;
  Required: boolean;
  Value?: string;
  Context?: string;
}

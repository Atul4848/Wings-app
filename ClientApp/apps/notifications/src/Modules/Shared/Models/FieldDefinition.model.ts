import { modelProtection, regex, Utilities } from '@wings-shared/core';
import { IAPIFieldDefinition } from '../Interfaces';
import { FieldTypeModel } from '.';
import { FIELD_TYPE } from '../Enums';

@modelProtection
export class FieldDefinitionModel {
  id: number = 0;
  displayName: string = '';
  variableName: string = '';
  fieldType: FieldTypeModel;
  description: string = '';
  required: boolean = false;
  value: string | boolean = '';
  context: string = '';

  constructor(data?: Partial<FieldDefinitionModel>) {
    Object.assign(this, data);
    this.fieldType = new FieldTypeModel(data?.fieldType);
  }

  static deserialize(fieldDefinition: IAPIFieldDefinition): FieldDefinitionModel {
    if (!fieldDefinition) {
      return new FieldDefinitionModel();
    }

    const data: Partial<FieldDefinitionModel> = {
      id: Utilities.getTempId(true),
      displayName: fieldDefinition.DisplayName,
      variableName: fieldDefinition.VariableName,
      fieldType: FieldTypeModel.deserialize(fieldDefinition.FieldType),
      description: fieldDefinition.Description,
      required: fieldDefinition.Required,
      value:
        fieldDefinition.FieldType === FIELD_TYPE.BOOL
          ? Utilities.isEqual(fieldDefinition.Value || '', 'true')
          : fieldDefinition.Value,
      context: fieldDefinition.Context,
    };

    return new FieldDefinitionModel(data);
  }

  public get errorMessage(): string {
    switch (this.fieldType.label) {
      case FIELD_TYPE.DATE:
      case FIELD_TYPE.ZULU_TIME:
        return this.customErrorMessage(null);
      case FIELD_TYPE.STRING:
        return this.customErrorMessage(regex.alphaNumericWithCommaSpace);
      case FIELD_TYPE.NUMBER:
        return this.customErrorMessage(regex.numbersWithEmpty);
      case FIELD_TYPE.DOUBLE:
        return this.customErrorMessage(regex.decimalOnly);
      default:
        return '';
    }
  }

  private get isRequiredErrorMessage(): string {
    return `The ${this.displayName} is required.`;
  }

  private get invalidFormatErrorMessage(): string {
    return `The ${this.displayName} must be a ${this.fieldType.label?.toLowerCase()}.`;
  }

  private get maxLengthErrorMessage(): string {
    return `The ${this.displayName} field should have max 200 characters.`;
  }

  private customErrorMessage(regexExp?: RegExp): string {
    if (!this.value && this.required) {
      return this.isRequiredErrorMessage;
    }

    if ((this.value as string)?.length > 200) {
      return this.maxLengthErrorMessage;
    }

    if (
      !regexExp?.test(this.value as string) &&
      !(this.fieldType.label === FIELD_TYPE.DATE || this.fieldType.label === FIELD_TYPE.ZULU_TIME)
    ) {
      return this.invalidFormatErrorMessage;
    }
    return '';
  }

  // serialize object for create/update API
  public serialize(): IAPIFieldDefinition {
    return {
      DisplayName: this.displayName,
      FieldType: this.fieldType.id,
      VariableName: this.variableName,
      Description: this.description,
      Required: this.required,
      Value: this.value?.toString() || '',
      Context: this.context,
    };
  }

  static deserializeList(fieldDefinitions: IAPIFieldDefinition[]): FieldDefinitionModel[] {
    return fieldDefinitions
      ? fieldDefinitions.map((fieldDefinition: IAPIFieldDefinition) =>
        FieldDefinitionModel.deserialize(fieldDefinition)
      )
      : [];
  }
}

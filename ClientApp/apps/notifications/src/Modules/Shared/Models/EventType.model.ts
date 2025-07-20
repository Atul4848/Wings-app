import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIEventType } from '../Interfaces';
import { FieldDefinitionModel } from './FieldDefinition.model';

@modelProtection
export class EventTypeModel extends IdNameModel implements ISelectOption {
  name: string = '';
  category: ISelectOption = null;
  subCategory: ISelectOption = null;
  description: string = '';
  systemCreated: boolean = false;
  publicEnabled: boolean = false;
  systemEnabled: boolean = false;
  fieldDefinitions: FieldDefinitionModel[] = [];
  inUse: boolean = false;

  constructor(data?: Partial<EventTypeModel>) {
    super();
    Object.assign(this, data);
    this.fieldDefinitions = data?.fieldDefinitions?.map(x => new FieldDefinitionModel(x)) || [];
  }

  static deserialize(eventType: IAPIEventType): EventTypeModel {
    if (!eventType) {
      return new EventTypeModel();
    }

    const data: Partial<EventTypeModel> = {
      id: eventType.EventTypeId,
      name: eventType.Name,
      category: eventType.Category ? { label: eventType.Category, value: eventType.Category } : null,
      subCategory: eventType.SubCategory ? { label: eventType.SubCategory, value: eventType.SubCategory } : null,
      description: eventType.Description,
      systemCreated: eventType.SystemCreated,
      publicEnabled: eventType.PublicEnabled,
      systemEnabled: eventType.SystemEnabled,
      fieldDefinitions: FieldDefinitionModel.deserializeList(eventType.ModelDefinition),
      inUse: eventType.InUse,
    };

    return new EventTypeModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIEventType {
    return {
      EventTypeId: this.id,
      Name: this.name,
      Description: this.description,
      Category: this.category?.value as string,
      SubCategory: this.subCategory?.value as string,
      SystemCreated: this.systemCreated,
      PublicEnabled: this.publicEnabled,
      SystemEnabled: this.systemEnabled,
      ModelDefinition:
        this.fieldDefinitions?.map((fieldDefinition: FieldDefinitionModel) => fieldDefinition.serialize()) || [],
      InUse: this.inUse,
    };
  }

  static deserializeList(eventTypes: IAPIEventType[]): EventTypeModel[] {
    return eventTypes ? eventTypes.map((eventType: IAPIEventType) => EventTypeModel.deserialize(eventType)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}

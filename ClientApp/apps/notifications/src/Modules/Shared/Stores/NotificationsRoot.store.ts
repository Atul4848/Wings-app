import {
  ChannelStore,
  CategoryStore,
  EventTypeStore,
  TemplateStore,
  EventStore,
  SubscriptionStore,
  ContactStore,
  DNDFilterStore,
  ProviderStore,
  ExecutionSummaryStore,
  SystemMessageStore,
} from './index';

class NotificationsRootStore {
  public channelStore: ChannelStore = new ChannelStore();
  public eventTypeStore: EventTypeStore = new EventTypeStore();
  public templateStore: TemplateStore = new TemplateStore();
  public eventStore: EventStore = new EventStore();
  public subscriptionStore: SubscriptionStore = new SubscriptionStore();
  public contactStore: ContactStore = new ContactStore();
  public dndFilterStore: DNDFilterStore = new DNDFilterStore();
  public providerStore: ProviderStore = new ProviderStore();
  public executionSummaryStore: ExecutionSummaryStore = new ExecutionSummaryStore();
  public categoryStore: CategoryStore = new CategoryStore();
  public systemMessageStore: SystemMessageStore = new SystemMessageStore();
}

const rootStore = new NotificationsRootStore();
export default rootStore;

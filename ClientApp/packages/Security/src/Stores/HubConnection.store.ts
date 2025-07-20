import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { action, computed, observable, runInAction } from 'mobx';
import { NOTIFICATIONS_EVENTS } from '../Enums/NotificationEvents.enum';
import { EnvironmentVarsStore, ENVIRONMENT_VARS} from '@wings-shared/env-store';
import Logger from '../Tools/Logger';
import AuthStore from './Auth.store';
import { MODE_TYPES, ModeStore } from '@wings-shared/mode-store';

/* istanbul ignore next */
class HubConnectionStore {
  readonly env = new EnvironmentVarsStore();
  readonly timeout: number = 60000;
  @observable public connection: HubConnection;

  @computed
  private get logLevel(): LogLevel {
    return ModeStore.isModeEnabled(MODE_TYPES.DEV)
      ? LogLevel.Debug
      : LogLevel.Error;
  }

  @action
  public enable(): Promise<void> {
    this.connection = new HubConnectionBuilder()
      .withUrl(
        `${this.env.getVar(
          ENVIRONMENT_VARS.PUSH_NOTIFICATIONS_URL
        )}/notifications`,
        {
          accessTokenFactory: () => AuthStore.user?.accessToken,
        }
      )
      .configureLogging(this.logLevel)
      .withAutomaticReconnect()
      .build();

    this.connection.serverTimeoutInMilliseconds = this.timeout;
    this.connection.onclose((error) => {
      if (ModeStore.isDevModeEnabled) {
        Logger.error('HubConnection has been closed', error);
      }
    });
    return this.connection.start();
  }

  public disable(): void {
    if (this.connection) {
      this.connection
        .stop()
        .then(() => runInAction(() => this.connection = null))
        .catch((err) => {
          if (ModeStore.isDevModeEnabled) {
            Logger.error(
              'An error occured while disabling hub connection.',
              err
            );
          }
        });
    }
  }

  public unsubscribeToEvents(): void {
    if (this.connection) {
      const events: string[] = [NOTIFICATIONS_EVENTS.EVENT_CREATED_LISTENER];
      events.forEach((event) => this.connection.off(event));
    }
  }
}

export default new HubConnectionStore();

import { IDiagnosticLogger, INotificationManager } from '@microsoft/applicationinsights-core-js';
import { ApplicationInsights, IApplicationInsights } from '@microsoft/applicationinsights-web';

export class ApplicationInsightsMock extends ApplicationInsights {
  constructor() {
    super({ config: { instrumentationKey: '' } });
  }

  public loadAppInsights(
    legacyMode?: boolean,
    logger?: IDiagnosticLogger,
    notificationManager?: INotificationManager
  ): IApplicationInsights {
    return this;
  }

  public clearAuthenticatedUserContext(): void {}
  public addTelemetryInitializer(oprios: any): void {}
  public setAuthenticatedUserContext(oprios: any): void {}
  public trackTrace(oprios: any): void {}
  public trackException(oprios: any): void {}
}

import { ApplicationInsights, SeverityLevel } from '@microsoft/applicationinsights-web';
import { Observable, OperatorFunction, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { catchError } from 'rxjs/operators';
import { UserClaims } from '@okta/okta-auth-js';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';

interface ILoggerOptions {
  prefix: string;
  fontSize: number;
  colors: {
    info: string;
    success: string;
    warning: string;
    error: string;
  };
}

enum LoggerType {
  Error = 'error',
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
}

class Logger {
  private env = new EnvironmentVarsStore();
  // TODO: REMOVE this temp id later, temp fix for running test cases
  private readonly instrumentationKey: string =
    this.env.getVar(ENVIRONMENT_VARS.AZURE_INSTRUMENTATION_KEY) || '92772e68-87e5-42a4-ae72-a7c667d478be';
  appInsights: ApplicationInsights;
  private isModeAllowed: boolean = true;
  private isEnabled: boolean = true;
  readonly options: ILoggerOptions = {
    prefix: 'Logger',
    fontSize: 12,
    colors: {
      [LoggerType.Info]: '#ba55d3',
      [LoggerType.Success]: '#3cb371',
      [LoggerType.Warning]: '#ff8c00',
      [LoggerType.Error]: '#dc143c',
    },
  };

  constructor() {
    this.appInsights = new ApplicationInsights({
      config: {
        // enableAutoRouteTracking: true,
        instrumentationKey: this.instrumentationKey,
      },
    });
    this.appInsights.loadAppInsights();
    this.loadCustomTelemetryProperties();
  }

  public clearUserId(): void {
    this.appInsights.clearAuthenticatedUserContext();
  }

  private loadCustomTelemetryProperties(): void {
    this.appInsights.addTelemetryInitializer(envelope => {
      const item = envelope.baseData;
      item.properties = item.properties || {};
      item.properties['ApplicationPlatform'] = 'WEB';
      item.properties['EnvironmentName'] = this.env.getVar(ENVIRONMENT_VARS.HOST_ENVIRONMENT);
    });
  }

  // Set User context from Auth Store after login success
  public setAuthenticatedUserContext({ name }: UserClaims): void {
    this.appInsights.context.user.id = name;
    this.appInsights.setAuthenticatedUserContext(name);
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public toggle(isEnabled: boolean): void {
    isEnabled ? this.enable() : this.disable();
  }

  public info(message: string, ...payload: any[]): void {
    this.writeMessage(LoggerType.Info, message, payload);
    this.appInsights.trackTrace({ message, severityLevel: SeverityLevel.Information });
  }

  public success(message: string, ...payload: any[]): void {
    this.writeMessage(LoggerType.Success, message, payload);
  }

  public warning(message: string, ...payload: any[]): void {
    this.writeMessage(LoggerType.Warning, message, payload);
  }

  public error(message: string, ...payload: any[]): void {
    this.writeMessage(LoggerType.Error, message, payload);
    this.appInsights.trackException({
      exception: new Error(message),
      severityLevel: SeverityLevel.Error,
    });
  }

  public get observableCatchError(): OperatorFunction<any, any> {
    return catchError((error: AxiosError, _: Observable<any>) => {
      this.error(error.message);
      return throwError(error);
    })
  }

  private writeMessage(type: LoggerType, message: string, payload?: any[]): void {
    if (!this.isEnabled || !this.isModeAllowed) {
      this.isModeAllowed = true;
      return;
    }

    let method: 'log' | 'warn' | 'error' = 'log';

    switch (type) {
      case LoggerType.Info:
      case LoggerType.Success:
        method = 'log';
        break;
      case LoggerType.Warning:
        method = 'warn';
        break;
      case LoggerType.Error:
        method = 'error';
        break;
    }

    console[method](
      `%c[${this.options.prefix}] ${message}`,
      `color: ${this.options.colors[type]}; font-size: ${this.options.fontSize}px;`,
      ...payload
    );
  }
}

const loggerService = new Logger();

export default loggerService;
export { Logger as PureLogger };

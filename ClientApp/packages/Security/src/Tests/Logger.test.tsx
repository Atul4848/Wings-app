import { expect } from 'chai';
import { ApplicationInsightsMock } from '@wings/shared';
import { PureLogger } from '../Tools/Logger';
import * as sinon from 'sinon';

describe('Logger', () => {
  let logger: PureLogger;
  let loggerInstance: any;

  beforeEach(() => {
    logger = new PureLogger();
    logger.appInsights = new ApplicationInsightsMock();
    // Used to test private methods
    loggerInstance = logger;
    loggerInstance.appInsights.context = { user: { id: '' } };
  });

  it('should call clearAuthenticatedUserContext withn clearUserId method', () => {
    const testSpy = sinon.spy(logger.appInsights, 'clearAuthenticatedUserContext');
    logger.clearUserId();
    expect(testSpy.calledOnce).to.true;
  });

  it('should should Enable/Disable Logger', () => {
    logger.toggle(true);
    expect(loggerInstance.isEnabled).to.true;

    logger.toggle(false);
    expect(loggerInstance.isEnabled).to.false;
  });

  it('should log proper information in message', () => {
    const writeMessageSpy = sinon.spy(loggerInstance, 'writeMessage');
    logger.info('Test info message');
    logger.success('Test success message');
    logger.warning('Test warning message');
    expect(writeMessageSpy.callCount).to.equal(3);
  });

  it('should not call writeMessage method if Mode is not Allowed', () => {
    let consoleLogSpy = sinon.spy(console, 'log');
    loggerInstance.isModeAllowed = false;
    logger.info('Test info message');
    expect(consoleLogSpy.notCalled).to.true;
  });

  it('should set Authenticated User Context', () => {
    loggerInstance.setAuthenticatedUserContext({ name: 'Test' });
    expect(loggerInstance.appInsights.context.user.id).to.eq('Test');
  });
});

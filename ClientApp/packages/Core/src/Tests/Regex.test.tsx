import { expect } from 'chai';
import { regex } from '../Tools/Regex';
import { conformToMask } from 'react-text-mask';

describe('Regex', function () {
  it('should pass timeOffset regex', function () {
    expect(regex.timeOffset.test('+11:00')).to.eq(true);
  });

  it('should pass timeOffsetInSeconds regex with plus and number', function () {
    expect(regex.timeOffsetInSeconds.test('+1')).to.eq(true);
  });

  it('should pass timeOffsetInSeconds regex only with number', function () {
    expect(regex.timeOffsetInSeconds.test('1')).to.eq(true);
  });

  it('should pass year regex', function () {
    expect(regex.year.test('2020')).to.eq(true);
  });

  it('should pass numberOnly regex', function () {
    expect(regex.numberOnly.test('20')).to.eq(true);
  });

    it('should pass negativeNumberWithTwoDecimal regex for all possible case', function () {
      // should pass valid numbers
      expect(regex.negativeNumberWithTwoDecimal.test('730.12')).to.eq(true);
      expect(regex.negativeNumberWithTwoDecimal.test('15')).to.eq(true);
      expect(regex.negativeNumberWithTwoDecimal.test('-730.12')).to.eq(true);
      expect(regex.negativeNumberWithTwoDecimal.test('-15')).to.eq(true);

      // should fail invalid numbers
      expect(regex.negativeNumberWithTwoDecimal.test('15.')).to.eq(false);
      expect(regex.negativeNumberWithTwoDecimal.test('730.1253')).to.eq(false);
      expect(regex.negativeNumberWithTwoDecimal.test('-15.')).to.eq(false);
      expect(regex.negativeNumberWithTwoDecimal.test('-730.1253')).to.eq(false);
    });

  it('should pass numberWithTwoDecimal regex for all possible case', function () {
    // should pass valid numbers
    expect(regex.numberWithTwoDecimal.test('730.12')).to.eq(true);
    expect(regex.numberWithTwoDecimal.test('15')).to.eq(true);

    // should fail invalid numbers
    expect(regex.numberWithTwoDecimal.test('15.')).to.eq(false);
    expect(regex.numberWithTwoDecimal.test('730.1253')).to.eq(false);
  });

  it('should pass zoneDst regex', function () {
    expect(regex.zoneDst.test('+10:00')).to.eq(true);
  });

  it('should pass conditionValue regex', function () {
    expect(regex.conditionValue.test('test9')).to.eq(true);
  });

  it('should not pass invalid condition value', function () {
    expect(regex.conditionValue.test('123')).to.be.false;
  });

  it('should pass icaoList regex', function () {
    expect(regex.icaoList.test('KHOU,KDAL')).to.eq(true);
    expect(regex.icaoList.test('KHOU KDAL')).to.eq(true);
  });

  it('should pass excelFileOnly regex', function () {
    expect(regex.excelFileOnly.test('.xlsx')).to.eq(true);
  });

  it('should pass alphabetsWithSpaces regex', function () {
    expect(regex.alphabetsWithSpaces.test('test new')).to.eq(true);
  });

  it('should pass cityAlternateList regex without space between name', function () {
    expect(regex.cityAlternateList.test('Chandigarh,punjab')).to.eq(true);
  });

  it('should pass cityAlternateList regex having space between name', function () {
    expect(regex.cityAlternateList.test('Houston, Clear Lake')).to.eq(true);
  });

  it('should pass cityAlternateList regex having number and space between name', function () {
    expect(regex.cityAlternateList.test('Houston11, Clear Lake')).to.eq(true);
  });

  it('invalid cityAlternateList having two commas', function () {
    expect(regex.cityAlternateList.test(',, Clear Lake')).to.eq(false);
  });

  it('invalid cityAlternateList with dot', function () {
    expect(regex.cityAlternateList.test('Houston. Clear Lake')).to.eq(false);
  });

  it('should pass valid latitude', function () {
    // latitude with positive value
    expect(regex.latLong.test('12.12')).to.be.true;

    // latitude with negative value
    expect(regex.latLong.test('-12.12')).to.be.true;
  });

  it('should not pass invalid latitude', function () {
    // latitude with alphabet
    expect(regex.latLong.test('12.d')).to.be.false;

    // latitude with space
    expect(regex.latLong.test('12. 12')).to.be.false;
  });

  it('should pass alphaNumericWithHyphen regex', function () {
    expect(regex.alphaNumericWithHyphen.test('HE')).to.be.true;
    expect(regex.alphaNumericWithHyphen.test('HE-TE')).to.be.true;
  });

  it('should fail alphaNumericWithHyphen regex', function () {
    expect(regex.alphaNumericWithHyphen.test('HE_')).to.be.false;
    expect(regex.alphaNumericWithHyphen.test('HE%')).to.be.false;
  });

  it('should pass stateCode regex', function () {
    expect(regex.statecode.test('HE-IE8')).to.be.true;
    expect(regex.statecode.test('HE-TCE')).to.be.true;
  });

  it('should fail stateCode regex', function () {
    expect(regex.statecode.test('HE_')).to.be.false;
    expect(regex.statecode.test('HE%')).to.be.false;
  });

  it('should pass alphaNumeric regex', function () {
    expect(regex.alphaNumeric.test('HE')).to.be.true;
    expect(regex.alphaNumeric.test('HE4')).to.be.true;
  });

  it('should fail alphaNumeric regex', function () {
    expect(regex.alphaNumeric.test('TE$')).to.be.false;
    expect(regex.alphaNumeric.test('T@%')).to.be.false;
  });

  it('should pass upperCase regex', function () {
    expect(regex.upperCase.test('TE')).to.be.true;
    expect(regex.upperCase.test('TES')).to.be.true;
  });

  it('should fail upperCase regex', function () {
    expect(regex.upperCase.test('sfd')).to.be.false;
    expect(regex.upperCase.test('ds')).to.be.false;
  });

  it('should pass cronExpression regex', () => {
    expect(regex.cronExpression.test('0 0 1 * * *')).to.be.true;
    expect(regex.cronExpression.test('0 0 1 */2 * *')).to.be.true;
    expect(regex.cronExpression.test('* * * * * *')).to.be.true;
  });

  it('should fail cronExpression regex', () => {
    expect(regex.cronExpression.test('/ 0 1 * * *')).to.be.false;
    expect(regex.cronExpression.test('* * * *')).to.be.false;
  });

  it('should pass numeric regex', function () {
    expect(regex.numeric.test('1')).to.be.true;
    expect(regex.numeric.test('10')).to.be.true;
  });

  it('should fail numeric regex', function () {
    expect(regex.numeric.test('-10')).to.be.false;
    expect(regex.numeric.test('ds')).to.be.false;
  });

  it('should pass divisbleByFive regex', function () {
    expect(regex.divisbleByFive.test('75')).to.be.true;
    expect(regex.divisbleByFive.test('80')).to.be.true;
  });

  it('should fail divisbleByFive regex', function () {
    expect(regex.divisbleByFive.test('287')).to.be.false;
    expect(regex.divisbleByFive.test('774')).to.be.false;
  });

  it('should return proper mask values', () => {
    const value1 = conformToMask('10jan20', regex.dateInputMask, { guide: false }).conformedValue;
    expect(value1).to.be.eq('10-jan-20');

    // CASE two
    const value2 = conformToMask('10jan', regex.dateInputMask, { guide: false }).conformedValue;
    expect(value2).to.be.eq('10-jan-');

    // CASE 3 ignore extra values
    const value3 = conformToMask('10jan202599', regex.dateInputMask, { guide: false }).conformedValue;
    expect(value3).to.be.eq('10-jan-20');
  });

  it('should pass stripedHTML regex', () => {
    expect('<div>TEST</div>'.replace(regex.stripedHTML, '')).to.be.equal('TEST');
    expect('<p></p>'.replace(regex.stripedHTML, '')).to.be.equal('');
  });

  it('should pass negativeNumber regex', function () {
    expect(regex.negativeNumber.test('-30')).to.be.true;
    expect(regex.negativeNumber.test('-80')).to.be.true;
  });

  it('should fail negativeNumber regex', function () {
    expect(regex.negativeNumber.test('0')).to.be.false;
    expect(regex.negativeNumber.test('10.10')).to.be.false;
  });

  it('should pass alphaNumericWithUnderscore regex', function () {
    expect(regex.alphaNumericWithUnderscore.test('HE')).to.be.true;
    expect(regex.alphaNumericWithUnderscore.test('HE_TE')).to.be.true;
  });

  it('should fail alphaNumericWithUnderscore regex', function () {
    expect(regex.alphaNumericWithUnderscore.test('HE-')).to.be.false;
    expect(regex.alphaNumericWithUnderscore.test('HE%')).to.be.false;
  });

  it('should pass all regex', function () {
    expect(regex.all.test('TEST-NEW#')).to.be.true;
    expect(regex.all.test('TE_TE')).to.be.true;
  });

  it('should fail all regex', function () {
    expect(regex.all.test('')).to.be.false;
  });

  it('should pass email regex', function () {
    expect(regex.email.test('check@gmail.com')).to.be.true;
    expect(regex.email.test('test@co.uk')).to.be.true;
  });

  it('should fail email regex', function () {
    expect(regex.email.test('test@gmail.')).to.be.false;
    expect(regex.email.test('check@')).to.be.false;
    expect(
      regex.email.test(
        'thisemaillengthisgreaterthenhundredwhichisinvaliditshouldbelessthenhundrednotgreater@universalweather.com'
      )
    ).to.be.false;
  });

  it('should extract all handlebars', function () {
    const testMessage: string = 'An email sent to an address: {{email}}';
    expect(testMessage.match(regex.extractTextBetweenHandlebar)).to.have.length(1);
  });

  it('should fail to extract all handlebars', function () {
    const testMessage: string = 'An email sent to an address';
    expect(testMessage.match(regex.extractTextBetweenHandlebar)).to.be.null;
  });

  it('should fail to validate string with spaces', function () {
    const message: string = 'demo test1';
    expect(regex.alphaNumericWithoutSpaces.test(message)).to.be.false;
  });

  it('should validate string without spaces', function () {
    const message: string = 'demo1';
    expect(regex.alphaNumericWithoutSpaces.test(message)).to.be.true;
  });

  it('should validate number only', function () {
    const number: string = '12345';
    expect(regex.numbersWithEmpty.test(number)).to.be.true;
  });

  it('should validate empty string for number field', function () {
    const number: string = '';
    expect(regex.numbersWithEmpty.test(number)).to.be.true;
  });

  it('should validate decimal value', function () {
    const number: string = '123456789.12';
    expect(regex.decimalOnly.test(number)).to.be.true;
  });

  it('should fail to validate decimal value', function () {
    const number: string = 'test';
    expect(regex.decimalOnly.test(number)).to.be.false;
  });

  it('should pass commaSeperatedNumber check', function () {
    const number: string = '2,5,6';
    expect(regex.commaSeperatedNumber.test(number)).to.be.true;
  });

  it('should pass stayHotelsAllowed check', function () {
    const value: string = 'test,test1,test2';
    const value1 = ',';
    // testing length 100+
    const value2 =
      'Test string to check whether it works with stay holtels allowed regex or not. if greater it is False'; // string length = 100
    expect(regex.stayHotelsAllowed.test(value)).to.be.true;
    expect(regex.stayHotelsAllowed.test(value1)).to.be.false;
    expect(regex.stayHotelsAllowed.test(value2)).to.be.true;
    expect(regex.stayHotelsAllowed.test(`${value2}test`)).to.be.false; // string length 104
  });

  it('should pass domesticMeasureRestrictedActivities check', function () {
    const value: string = 'test,test1,test2';
    const value1 = ',';
    // testing length 50+
    const value2 = 'Test string to check whether it works with stay ho'; // string length = 50
    expect(regex.domesticMeasureRestrictedActivities.test(value)).to.be.true;
    expect(regex.domesticMeasureRestrictedActivities.test(value1)).to.be.false;
    expect(regex.domesticMeasureRestrictedActivities.test(value2)).to.be.true;
    expect(regex.domesticMeasureRestrictedActivities.test(`${value2}test`)).to.be.false; // string length 54
  });

  it('should validate software version', function () {
    const version: string = '12.12.12';
    const version1: string = '1.1.1';
    expect(regex.softwareVersion.test(version)).to.be.true;
    expect(regex.softwareVersion.test(version1)).to.be.true;
  });

  it('should fail to validate software version', function () {
    const version: string = '123.45';
    const version1: string = '0.0.0';
    expect(regex.softwareVersion.test(version)).to.be.false;
    expect(regex.softwareVersion.test(version1)).to.be.false;
  });

  it('should pass testFrequencies check', function () {
    const number: string = '2,50,99';
    const number1: string = ',5';
    const number2: string = '0';
    const number3: string = '100';

    expect(regex.testFrequencies.test(number)).to.be.true;
    expect(regex.testFrequencies.test(number1)).to.be.false;
    expect(regex.testFrequencies.test(number2)).to.be.false;
    expect(regex.testFrequencies.test(number3)).to.be.false;
  });

  it('should pass airframeEngines check', function () {
    const string: string = 'Test,Test50,12345';
    const string1: string = ',5';

    expect(regex.airframeEngines.test(string)).to.be.true;
    expect(regex.airframeEngines.test(string1)).to.be.false;
  });

  it('should pass maxFlightLevel check', function () {
    const number: string = '252';
    const number1: string = '12';
    const number2: string = '7585';

    expect(regex.maxFlightLevel.test(number)).to.be.true;
    expect(regex.maxFlightLevel.test(number1)).to.be.false;
    expect(regex.maxFlightLevel.test(number2)).to.be.false;
  });

  it('should pass phone number check', function () {
    const phoneNumber: string = '+919803960094';
    const phoneNumber1: string = '+19803960094';

    expect(regex.phoneNumber.test(phoneNumber)).to.be.true;
    expect(regex.phoneNumber.test(phoneNumber1)).to.be.true;
  });

  it('should validate one place decimal regex', function () {
    expect(regex.onePlaceDecimal.test('1.1')).to.be.true;
    expect(regex.onePlaceDecimal.test('0.5')).to.be.true;
  });

  it('should fail to validate one place decimal regex', function () {
    expect(regex.onePlaceDecimal.test('1.')).to.be.false;
    expect(regex.onePlaceDecimal.test('0.0')).to.be.false;
  });
  
  it('should pass text with handlebars', function () {
    const text: string = 'This is a sample test {{message}}.';
    expect(regex.alphabetWithOptionalHandlebars.test(text)).to.be.true;
  });

  it('should pass text without handlebars', function () {
    const text: string = 'This is a sample test.';
    expect(regex.alphabetWithOptionalHandlebars.test(text)).to.be.true;
  });

  it('should fail to validate text with handlebars', function () {
    const text: string = 'This is a sample test {{message}.';
    expect(regex.alphabetWithOptionalHandlebars.test(text)).to.be.false;
  });

  it('should pass sendgrid template regex', function () {
    expect(regex.sendgridTemplateId.test('d-d048dd28479f480dbb28061da87c78db')).to.be.true;
    expect(regex.sendgridTemplateId.test('d-00000028479f480dbb28061da87c78db23131')).to.be.true;
  });

  it('should fail sendgrid template regex', function () {
    expect(regex.sendgridTemplateId.test('!--qwerty@123456sdfsfsf78d9')).to.be.false;
    expect(regex.sendgridTemplateId.test('@-qwertyjkdhjfds1234567df89')).to.be.false;
  });

  it('should pass embeddedLink regex', function () {
    expect(regex.embeddedLink.test('https://www.google.com')).to.be.true;
    expect(regex.embeddedLink.test('https://123.123:3333')).to.be.true;
  });

  it('should fail to validate string with spaces', () => {
    expect(regex.alphabetsWithoutSpaces.test('test new')).to.be.false;
  });

  it('should validate the string without spaces', () => {
    expect(regex.alphabetsWithoutSpaces.test('test')).to.be.true;
  });

  it('should pass string with lowercase, number and period', () => {
    expect(regex.lowerCaseGroupName.test('uwa.uvgo.users1')).to.be.true;
  });

  it('should fail string with lowercase, number and period', () => {
    expect(regex.lowerCaseGroupName.test('Uwa.uvgo1')).to.be.false;
  });

  it('should validate onePlaceDecimalWithZero regex', () => {
    expect(regex.onePlaceDecimalWithZero.test('0')).to.be.true;
    expect(regex.onePlaceDecimalWithZero.test('0.5')).to.be.true;
    expect(regex.onePlaceDecimalWithZero.test('9.0')).to.be.true;
  });

  it('should fail to validate onePlaceDecimalWithZero regex', () => {
    expect(regex.onePlaceDecimalWithZero.test('1.')).to.be.false;
    expect(regex.onePlaceDecimalWithZero.test('0.11')).to.be.false;
  });

  it('should validate populationRange regex', () => {
    expect(regex.populationRange.test('1')).to.be.true;
    expect(regex.populationRange.test('10')).to.be.true;
  });

  it('should fail to validate populationRange regex', () => {
    expect(regex.populationRange.test('0')).to.be.false;
    expect(regex.populationRange.test('-10')).to.be.false;
    expect(regex.populationRange.test('test')).to.be.false;
  });

  it('should validate islandCode regex', () => {
    expect(regex.islandCode.test('AB-AC')).to.be.true;
    expect(regex.islandCode.test('AB-AC-01')).to.be.true;
  });

  it('should fail to validate islandCode regex', () => {
    expect(regex.islandCode.test('A1-A2')).to.be.false;
    expect(regex.islandCode.test('AB-AC-AD')).to.be.false;
    expect(regex.islandCode.test('AB-A1')).to.be.false;
    expect(regex.islandCode.test('AB#AB%56')).to.be.false;
  });

  it('should validate wingspanLimit regex', () => {
    expect(regex.wingspanLimit.test('23.5')).to.be.true;
    expect(regex.wingspanLimit.test('786.78')).to.be.true;
  });

  it('should fail to validate wingspanLimit regex', () => {
    expect(regex.wingspanLimit.test('1234')).to.be.false;
    expect(regex.wingspanLimit.test('12.876')).to.be.false;
    expect(regex.wingspanLimit.test('453.564')).to.be.false;
  });

  it('should validate stringWithSlash regex', () => {
    expect(regex.stringWithSlash.test('tets/test')).to.be.true;
    expect(regex.stringWithSlash.test('test')).to.be.true;
    expect(regex.stringWithSlash.test('test&test')).to.be.false;
  });

  it('should validate airportFrequency regex', function() {
    expect(regex.airportFrequency.test('1234')).to.be.false;
    expect(regex.airportFrequency.test('12.8763')).to.be.false;
    expect(regex.airportFrequency.test('453.564')).to.be.true;
    expect(regex.airportFrequency.test('45.56')).to.be.true;
  });

  it('should validate phoneNumberWithHyphen regex', function() {
    expect(regex.phoneNumberWithHyphen.test('12345ABCD')).to.be.false;
    expect(regex.phoneNumberWithHyphen.test('12.8763')).to.be.false;
    expect(regex.phoneNumberWithHyphen.test('984454565666')).to.be.true;
    expect(regex.phoneNumberWithHyphen.test('123-565-5655')).to.be.true;
  });

  it('should pass threeDigitsLimit regex', function () {
    expect(regex.threeDigitsLimit.test('214')).to.be.true;
    expect(regex.threeDigitsLimit.test('999')).to.be.true;
    expect(regex.threeDigitsLimit.test('1256')).to.be.false;
  });
});

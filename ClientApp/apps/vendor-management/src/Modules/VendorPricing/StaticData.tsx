export const getOptions =(nameArray:string[]):any =>{
  return nameArray.map((item,index)=>{
    return getOption([ item,`${index+1}` ]);
  });
}

export const getOption = (option:string[]):any=>{
  return ({
    id:option[1],
    name:option[0],
    label:option[0],
    value:option[1]
  });
}

export const getGridOption = (
  vendorIdArray:string[],
  vendorLocationIdArray:string[],
  id:number,
  serviceItemNameArray:string[],
  includedInHandlingArray:string[],
  parameterArray:string[],  
  currencyArray:string[],
  unitsArray:string[],
  pricingStatusArray:string[],
      
  lowerLimit:number,
  upperLimit:number,
  price:number,
    
  formulaComments:string,
  validFrom:string ,
  validTo: string,
     
):any =>
{
  return ({
    id:id,
    vendorId:getOption(vendorIdArray),
    vendorLocationId: [
      ...getOptions(vendorLocationIdArray)
    ],
    serviceItemName: getOption(serviceItemNameArray),
    commissionable:false,
    directService:true,
    is3rdPartyLocation:'',
    variablePricing:false,
    includedHandling:getOption(includedInHandlingArray),
    priceUnavailable:false,
    parameter:getOption(parameterArray),
    lowerLimit:lowerLimit,
    upperLimit:upperLimit,
    price:price,
    currency:getOption(currencyArray),
    units:getOption(unitsArray),
    formulaComments:formulaComments,
    validFrom: validFrom,
    validTo: validTo,
    pricingStatus:getOption(pricingStatusArray)
  });
}

const vendorIdSelectOptions  = [
  ...getOptions([ 'EUE','VON','DEN','RON' ])
]
const vendorLocationIdSelectOptions =[
  ...getOptions([ 'LRCV', 'MDHN', 'TDNO', 'DRTA' ])
]
const serviceItemNameSelectOptions = [
  ...getOptions([ 'Ground Power Unit', 'Handling', 'Air Start', 'Stairs' ])
]
const parameterSelectOptions = [
  ...getOptions([ 'MTOW', 'Metric Tons', 'AROM', 'DYBN' ])
]
const includedHandlingFeeSelectOptions = [
  ...getOptions([ 'Yes', 'No', 'Conditional', 'Yes+' ])
]
const currencySelectOptions = [
  ...getOptions([ 'EUR', 'AED', 'USD', 'INR' ])
]
const unitsSelectOptions = [
  ...getOptions([ 'Flat Rate', 'Per 5 Minutes', 'Per Use', 'Per 1 Hour' ])
]
const statusSelectOptions = [
  ...getOptions([ 'Active', 'In Active', 'Invited', 'Suspect' ])
]

const pricingGridData =
    {
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 12,
      results:[
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          0,
          5,
          75,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          6,
          10,
          100,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'Yes','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          11,
          20,
          150,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          21,
          30,
          175,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'Yes+','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          31,
          50,
          200,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'Conditional','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          51,
          70,
          225,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          71,
          999,
          250,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Ground Power Unit','1' ],
          [ 'Yes','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per 1 Hour','1' ],
          [ 'Active','1' ],
          0,
          999,
          60,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Air Start','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per 5 Minutes','1' ],
          [ 'Active','1' ],
          0,
          999,
          30,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Push Back','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per Use','1' ],
          [ 'Active','1' ],
          0,
          999,
          40,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Potable Water','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per Use','1' ],
          [ 'Active','1' ],
          0,
          999,
          20,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Lavatory Services','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per Use','1' ],
          [ 'Active','1' ],
          0,
          999,
          20,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Stairs','1' ],
          [ 'Yes','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per Use','1' ],
          [ 'Active','1' ],
          0,
          999,
          35,
          '',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Transportation','1' ],
          [ 'Yes','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per Use','1' ],
          [ 'Active','1' ],
          0,
          999,
          43,
          'Car, 19% VAT included',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'EUE','1' ],
          [ 'LRCV' ],
          1,
          [ 'Transportation','1' ],
          [ 'Yes+','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Per Use','1' ],
          [ 'Active','1' ],
          0,
          999,
          65,
          'Minivan, 19% VAT included',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'GET','1' ],
          [ 'LEAS' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          1,
          4.49,
          152,
          'Minivan, 19% VAT included',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'GET','1' ],
          [ 'LEAS' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          4.5,
          6.79,
          257,
          'Minivan, 19% VAT included',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'GET','1' ],
          [ 'LEAS' ],
          1,
          [ 'Handling','1' ],
          [ 'Yes','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          6.8,
          13.49,
          284,
          'Minivan, 19% VAT included',
          '2023-06-05',
          '2024-06-05'
        ),
        getGridOption(
          [ 'GET','1' ],
          [ 'LEAS' ],
          1,
          [ 'Handling','1' ],
          [ 'No','1' ],
          [ 'MTOW, Metric Tons','1' ],
          [ 'EUR','1' ],
          [ 'Flat Rate','1' ],
          [ 'Active','1' ],
          13.5,
          31.99,
          491,
          'Minivan, 19% VAT included',
          '2023-06-05',
          '2024-06-05'
        )
      ]
    }





export {
  vendorIdSelectOptions,
  serviceItemNameSelectOptions,
  vendorLocationIdSelectOptions,
  parameterSelectOptions,
  includedHandlingFeeSelectOptions,
  currencySelectOptions,
  unitsSelectOptions,
  statusSelectOptions,
  pricingGridData
};
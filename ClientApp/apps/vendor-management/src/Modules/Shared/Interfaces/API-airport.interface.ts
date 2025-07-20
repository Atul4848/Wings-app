export interface IAPIAirport {
    airportId: number;
    name: string;
    icaoCode: {
        icaoCodeId: number;
        code: string;
    },
    uwaCode: string;
    faaCode: string;
    iataCode: string;
    regionalCode: string;
    displayCode: string;
}
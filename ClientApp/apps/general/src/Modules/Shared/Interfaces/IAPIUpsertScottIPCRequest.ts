export interface IAPIUpsertScottIPCRequest {
    Id?: string;
    SIPCUserId: number;
    SIPCName: string;
    UniversalAccountNumber: string;
    CaptainName: string;
    CrewPaxId: number | null;
}
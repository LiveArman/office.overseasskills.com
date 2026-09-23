export type CommissionInput={subtotal:number;directRate:number;territoryRate:number;attribution:'direct'|'territory'}
export function calculateCommission(input:CommissionInput){const rate=input.attribution==='direct'?input.directRate:input.territoryRate;return Math.round(input.subtotal*rate*100)/100}
export function monthPeriod(date=new Date(),timezone='Asia/Dhaka'){const end=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1));const start=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()-1,1));return {periodStart:start,periodEnd:end}}

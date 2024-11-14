import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface TaxPayer {
  'tid' : string,
  'address' : string,
  'lastName' : string,
  'firstName' : string,
}
export interface _SERVICE {
  'addTaxPayer' : ActorMethod<[string, string, string, string], undefined>,
  'getAllTaxPayers' : ActorMethod<[], Array<TaxPayer>>,
  'getTaxPayer' : ActorMethod<[string], Array<TaxPayer>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

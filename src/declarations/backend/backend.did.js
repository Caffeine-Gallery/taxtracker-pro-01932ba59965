export const idlFactory = ({ IDL }) => {
  const TaxPayer = IDL.Record({
    'tid' : IDL.Text,
    'address' : IDL.Text,
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  return IDL.Service({
    'addTaxPayer' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    'getAllTaxPayers' : IDL.Func([], [IDL.Vec(TaxPayer)], ['query']),
    'getTaxPayer' : IDL.Func([IDL.Text], [IDL.Vec(TaxPayer)], ['query']),
    'getTaxPayerByField' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(TaxPayer)],
        ['query'],
      ),
    'searchTaxPayer' : IDL.Func([IDL.Text], [IDL.Vec(TaxPayer)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

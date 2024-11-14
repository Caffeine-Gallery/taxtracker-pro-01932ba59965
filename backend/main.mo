import Func "mo:base/Func";
import Hash "mo:base/Hash";

import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

actor {

    // Define the TaxPayer type
    type TaxPayer = {
        tid : Text;
        firstName : Text;
        lastName : Text;
        address : Text;
    };

    // Use a stable variable to store TaxPayers
    stable var stableTaxPayers : [(Text, TaxPayer)] = [];

    var taxPayers : HashMap.HashMap<Text, TaxPayer> = HashMap.HashMap<Text, TaxPayer>(10, Text.equal, Text.hash);

    // Function to add a new TaxPayer
    public shared func addTaxPayer(tid : Text, firstName : Text, lastName : Text, address : Text) : async () {
        let newTaxPayer : TaxPayer = {
            tid = tid;
            firstName = firstName;
            lastName = lastName;
            address = address;
        };
        taxPayers.put(tid, newTaxPayer);
    };

    // Function to get all TaxPayers
    public query func getAllTaxPayers() : async [TaxPayer] {
        return Iter.toArray(taxPayers.vals());
    };

    // Function to search for a TaxPayer by TID
    public query func getTaxPayer(tid : Text) : async [TaxPayer] {
        switch (taxPayers.get(tid)) {
            case (?taxPayer) { return [taxPayer]; };
            case (null) { return []; };
        };
    };

    // Preupgrade function to save state
    system func preupgrade() {
        if (taxPayers.size() > 0) {
            stableTaxPayers := Iter.toArray(taxPayers.entries());
        };
    };

    // Postupgrade function to restore state
    system func postupgrade() {
        taxPayers := HashMap.fromIter<Text, TaxPayer>(stableTaxPayers.vals(), 10, Text.equal, Text.hash);
    };
};

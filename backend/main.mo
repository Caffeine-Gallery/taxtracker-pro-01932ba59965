import Bool "mo:base/Bool";
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

    // Function to search for a TaxPayer by any field
    public query func searchTaxPayer(searchTerm : Text) : async [TaxPayer] {
        let lowerSearchTerm = Text.toLowercase(searchTerm);
        return Iter.toArray(Iter.filter(taxPayers.vals(), func (taxPayer : TaxPayer) : Bool {
            return Text.contains(Text.toLowercase(taxPayer.tid), #text lowerSearchTerm) or
                   Text.contains(Text.toLowercase(taxPayer.firstName), #text lowerSearchTerm) or
                   Text.contains(Text.toLowercase(taxPayer.lastName), #text lowerSearchTerm) or
                   Text.contains(Text.toLowercase(taxPayer.address), #text lowerSearchTerm);
        }));
    };

    // Function to search for a TaxPayer by a specific field
    public query func getTaxPayerByField(field : Text, searchTerm : Text) : async [TaxPayer] {
        let lowerSearchTerm = Text.toLowercase(searchTerm);
        return Iter.toArray(Iter.filter(taxPayers.vals(), func (taxPayer : TaxPayer) : Bool {
            switch (field) {
                case ("tid") { return Text.contains(Text.toLowercase(taxPayer.tid), #text lowerSearchTerm); };
                case ("firstName") { return Text.contains(Text.toLowercase(taxPayer.firstName), #text lowerSearchTerm); };
                case ("lastName") { return Text.contains(Text.toLowercase(taxPayer.lastName), #text lowerSearchTerm); };
                case ("address") { return Text.contains(Text.toLowercase(taxPayer.address), #text lowerSearchTerm); };
                case _ { return false; };
            };
        }));
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

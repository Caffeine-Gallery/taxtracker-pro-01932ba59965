import { backend } from 'declarations/backend';

const addTaxPayerForm = document.getElementById('addTaxPayerForm');
const searchButton = document.getElementById('searchButton');
const searchTerm = document.getElementById('searchTerm');
const searchField = document.getElementById('searchField');
const searchResult = document.getElementById('searchResult');
const taxPayerList = document.getElementById('taxPayerList');

// Function to display loading spinner
function showLoading() {
    return '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
}

// Function to add a new TaxPayer
addTaxPayerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tid = document.getElementById('tid').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;

    searchResult.innerHTML = showLoading();
    try {
        await backend.addTaxPayer(tid, firstName, lastName, address);
        addTaxPayerForm.reset();
        await loadTaxPayers();
    } catch (error) {
        console.error('Error adding TaxPayer:', error);
        searchResult.innerHTML = '<div class="alert alert-danger">Failed to add TaxPayer</div>';
    }
});

// Function to search for a TaxPayer
searchButton.addEventListener('click', async () => {
    const term = searchTerm.value;
    const field = searchField.value;
    if (!term) return;

    searchResult.innerHTML = showLoading();
    try {
        let result;
        if (field === 'all') {
            result = await backend.searchTaxPayer(term);
        } else {
            result = await backend.getTaxPayerByField(field, term);
        }
        if (result.length === 0) {
            searchResult.innerHTML = '<div class="alert alert-warning">No TaxPayer found with this search term</div>';
        } else {
            searchResult.innerHTML = '';
            result.forEach(taxPayer => {
                searchResult.innerHTML += `
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">${taxPayer.firstName} ${taxPayer.lastName}</h5>
                            <p class="card-text">TID: ${taxPayer.tid}</p>
                            <p class="card-text">Address: ${taxPayer.address}</p>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Error searching TaxPayer:', error);
        searchResult.innerHTML = '<div class="alert alert-danger">Failed to search TaxPayer</div>';
    }
});

// Function to load all TaxPayers
async function loadTaxPayers() {
    taxPayerList.innerHTML = showLoading();
    try {
        const taxPayers = await backend.getAllTaxPayers();
        taxPayerList.innerHTML = '';
        taxPayers.forEach(taxPayer => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `
                <strong>${taxPayer.firstName} ${taxPayer.lastName}</strong> - TID: ${taxPayer.tid}<br>
                Address: ${taxPayer.address}
            `;
            taxPayerList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading TaxPayers:', error);
        taxPayerList.innerHTML = '<div class="alert alert-danger">Failed to load TaxPayers</div>';
    }
}

// Initial load of TaxPayers
loadTaxPayers();

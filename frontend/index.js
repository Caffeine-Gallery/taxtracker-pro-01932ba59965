import { backend } from 'declarations/backend';

const addTaxPayerForm = document.getElementById('addTaxPayerForm');
const searchButton = document.getElementById('searchButton');
const searchTid = document.getElementById('searchTid');
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
    const tid = searchTid.value;
    if (!tid) return;

    searchResult.innerHTML = showLoading();
    try {
        const result = await backend.getTaxPayer(tid);
        if (result.length === 0) {
            searchResult.innerHTML = '<div class="alert alert-warning">No TaxPayer found with this TID</div>';
        } else {
            searchResult.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${result[0].firstName} ${result[0].lastName}</h5>
                        <p class="card-text">TID: ${result[0].tid}</p>
                        <p class="card-text">Address: ${result[0].address}</p>
                    </div>
                </div>
            `;
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

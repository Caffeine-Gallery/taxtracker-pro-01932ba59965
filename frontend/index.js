import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

const addTaxPayerForm = document.getElementById('addTaxPayerForm');
const searchButton = document.getElementById('searchButton');
const searchTerm = document.getElementById('searchTerm');
const searchField = document.getElementById('searchField');
const searchResult = document.getElementById('searchResult');
const taxPayerList = document.getElementById('taxPayerList');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const logoutButton = document.getElementById('logoutButton');
const usernameSpan = document.getElementById('username');
const taxCalculationForm = document.getElementById('taxCalculationForm');
const taxResult = document.getElementById('taxResult');
const exportButton = document.getElementById('exportButton');
const notificationArea = document.getElementById('notificationArea');
const authSection = document.getElementById('authSection');
const userProfile = document.getElementById('userProfile');

let authClient;

// Function to display loading spinner
function showLoading() {
    return '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
}

// Function to initialize AuthClient
async function initAuthClient() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        handleAuthenticated();
    }
}

// Function to handle authentication
async function handleAuthenticated() {
    const identity = authClient.getIdentity();
    const userPrincipal = identity.getPrincipal().toString();
    const username = await backend.getUser(userPrincipal);
    if (username) {
        usernameSpan.textContent = username;
        authSection.classList.add('d-none');
        userProfile.classList.remove('d-none');
    }
}

// Function to add a new TaxPayer
addTaxPayerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tid = document.getElementById('tid').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const income = parseInt(document.getElementById('income').value);

    searchResult.innerHTML = showLoading();
    try {
        await backend.addTaxPayer(tid, firstName, lastName, address, income);
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
                            <p class="card-text">Income: ${taxPayer.income}</p>
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
                Address: ${taxPayer.address}<br>
                Income: ${taxPayer.income}
            `;
            taxPayerList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading TaxPayers:', error);
        taxPayerList.innerHTML = '<div class="alert alert-danger">Failed to load TaxPayers</div>';
    }
}

// Function to calculate tax
taxCalculationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tid = document.getElementById('tidForTax').value;

    taxResult.innerHTML = showLoading();
    try {
        const tax = await backend.calculateTax(tid);
        taxResult.innerHTML = `<div class="alert alert-success">Tax for TID ${tid}: ${tax}</div>`;
    } catch (error) {
        console.error('Error calculating tax:', error);
        taxResult.innerHTML = '<div class="alert alert-danger">Failed to calculate tax</div>';
    }
});

// Function to export tax data
exportButton.addEventListener('click', async () => {
    try {
        const data = await backend.exportTaxData();
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tax_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting tax data:', error);
        notificationArea.classList.remove('d-none');
        notificationArea.textContent = 'Failed to export tax data';
    }
});

// Function to show notifications
function showNotification(message) {
    notificationArea.classList.remove('d-none');
    notificationArea.textContent = message;
    setTimeout(() => {
        notificationArea.classList.add('d-none');
    }, 5000);
}

// Login functionality
loginButton.addEventListener('click', async () => {
    await authClient.login({
        onSuccess: async () => {
            await handleAuthenticated();
        },
        identityProvider: process.env.DFX_NETWORK === 'ic' ? 'https://identity.ic0.app' : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_BACKEND}#authorize`,
    });
});

// Register functionality
registerButton.addEventListener('click', async () => {
    const username = prompt('Enter your username:');
    const password = prompt('Enter your password:');
    if (username && password) {
        try {
            await backend.registerUser(username, password);
            showNotification('User registered successfully');
        } catch (error) {
            console.error('Error registering user:', error);
            showNotification('Failed to register user');
        }
    }
});

// Logout functionality
logoutButton.addEventListener('click', async () => {
    await authClient.logout();
    authSection.classList.remove('d-none');
    userProfile.classList.add('d-none');
    usernameSpan.textContent = '';
});

// Initial load of TaxPayers and AuthClient initialization
initAuthClient();
loadTaxPayers();

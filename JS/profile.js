document.addEventListener('DOMContentLoaded', () => {
    fetchUserData();
});

// Logout function
function logout() {
    console.log('Logout button clicked');
    localStorage.removeItem('jwt');
    console.log('JWT removed from localStorage:', localStorage.getItem('jwt')); // Should log null
    window.location.href = 'index.html';
}

// Fetch user data
async function fetchUserData() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    console.log('JWT:', jwt);

    if (!jwt) {
        console.log('No JWT found, redirecting to login...');
        window.location.href = 'index.html';
        return;
    }

    try {
        console.log('Fetching user data...');
        const query = `
            query GetUserData {
                user {
                    login
                    email
                    firstName
                    lastName
                    campus
                }
            }
        `;
        console.log('GraphQL Query:', query);

        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        console.log('GraphQL Response Status:', response.status);
        console.log('GraphQL Response OK:', response.ok);

        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = JSON.parse(responseBody);
        console.log('User Data:', data);

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Failed to fetch user data');
        }

        const user = data.data.user[0];
        displayUserData(user);

    } catch (error) {
        console.error('Error fetching user data:', error);
        document.getElementById('userData').innerText = 'Failed to load user data.';
    }
}

// Display user data
function displayUserData(user) {
    const userDataDiv = document.getElementById('userData');
    userDataDiv.innerHTML = `
        <p>Username: ${user.login || 'N/A'}</p>
        <p>Email: ${user.email || 'N/A'}</p>
        <p>First Name: ${user.firstName || 'N/A'}</p>
        <p>Last Name: ${user.lastName || 'N/A'}</p>
        <p>Campus: ${user.campus || 'N/A'}</p>
    `;
}
async function fetchAuditRatio() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    if (!jwt) return;
    try {
        const query = `
            query {
                transaction(where: { type: { _eq: "audit" } }) {
                    amount
                }
            }
        `;
        console.log('Fetching audit data...');
        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch audit data');
        }
        const data = await response.json();
        console.log('Audit Data:', data);
        const auditTransactions = data.data.transaction;
        const totalAudits = auditTransactions.reduce((sum, t) => sum + t.amount, 0);
        const auditRatio = totalAudits > 0 ? (totalAudits / auditTransactions.length).toFixed(2) : 0;
        document.getElementById('auditData').innerText = `Audit Ratio: ${auditRatio}`;
    } catch (error) {
        console.error('Error fetching audit data:', error);
        document.getElementById('auditData').innerText = 'Failed to load audit data.';
    }
}
async function createXpGraph() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    if (!jwt) return;

    try {
        const query = `
            query {
                transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: asc }) {
                    amount
                    createdAt
                }
            }
        `;
        console.log('Fetching XP data for graph...');
        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch XP data for graph');
        }
        const data = await response.json();
        console.log('XP Data for Graph:', data);
        const xpTransactions = data.data.transaction;
        const labels = xpTransactions.map(t => new Date(t.createdAt).toLocaleDateString());
        const amounts = xpTransactions.map(t => t.amount);
        const xpCanvas = document.getElementById('xpGraph');
        console.log('XP Canvas:', xpCanvas); // Should log the <canvas> element
        if (!xpCanvas) {
            throw new Error('XP Canvas element not found!');
        }
        const ctx = xpCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'XP Over Time',
                    data: amounts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching XP data for graph:', error);
        document.getElementById('xpGraph').innerText = 'Failed to load XP graph.';
    }
}
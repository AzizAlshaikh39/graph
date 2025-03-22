async function fetchUserData() {
    const jwt = localStorage.getItem('jwt').replace(/^"(.*)"$/, '$1'); // Remove extra quotes
    console.log('JWT:', jwt);

    if (!jwt) {
        console.log('No JWT found, redirecting to login...');
        window.location.href = 'index.html';
        return;
    }

    try {
        console.log('Fetching user data...');
        const query = `
            query {
                user {
                    id
                    login
                    email
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

        const responseBody = await response.text(); // Log the raw response body
        console.log('Response Body:', responseBody);

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = JSON.parse(responseBody); // Parse the response body as JSON
        console.log('User Data:', data);

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Failed to fetch user data');
        }

        const user = data.data.user[0]; // Access the first user in the array
        document.getElementById('userData').innerHTML = `
            <p>ID: ${user.id || 'N/A'}</p>
            <p>Username: ${user.login || 'N/A'}</p>
            <p>Email: ${user.email || 'N/A'}</p>
        `;

    } catch (error) {
        console.error('Error fetching user data:', error);
        document.getElementById('userData').innerText = 'Failed to load user data.';
    }
}

fetchUserData();
async function fetchAuditRatio() {
    const jwt = localStorage.getItem('jwt').replace(/^"(.*)"$/, '$1');
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

fetchAuditRatio();
async function createXpGraph() {
    const jwt = localStorage.getItem('jwt').replace(/^"(.*)"$/, '$1');
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

        const ctx = document.getElementById('xpGraph').getContext('2d');
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

createXpGraph();
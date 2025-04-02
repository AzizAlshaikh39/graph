document.addEventListener('DOMContentLoaded', () => {
    fetchUserData();
    fetchAuditData();
    fetchXPData();
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
                    id
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
        <p>ID: ${user.id || 'N/A'}</p>
        <p>Username: ${user.login || 'N/A'}</p>
        <p>Email: ${user.email || 'N/A'}</p>
        <p>First Name: ${user.firstName || 'N/A'}</p>
        <p>Last Name: ${user.lastName || 'N/A'}</p>
        <p>Campus: ${user.campus || 'N/A'}</p>
    `;
}
// audits

async function fetchAuditData() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    console.log('[Audit] JWT:', jwt);  // Added prefix for clarity

    if (!jwt) {
        console.log('[Audit] No JWT found for audit query');
        return;
    }

    try {
        const query = `
            query GetAuditData {
                user {
                    auditRatio
                    totalUp
                    totalDown
                }
            }
        `;
        console.log('[Audit] GraphQL Query:', query);

        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        console.log('[Audit] Response Status:', response.status);
        
        const responseBody = await response.text();
        console.log('[Audit] Raw Response:', responseBody);  // Log raw response

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = JSON.parse(responseBody);
        console.log('[Audit] Parsed Data:', data);

        if (data.errors) {
            console.error('[Audit] GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Error in audit query');
        }

        console.log('[Audit] User Data:', data.data.user);  // Check user data structure
        const auditData = data.data.user[0];
        console.log('[Audit] Extracted Audit Data:', auditData);
        
        displayAuditData(auditData);

    } catch (error) {
        console.error('[Audit] Error:', error);
        document.getElementById('auditData').innerText = 'Failed to load audit data.';
    }
}
function displayAuditData(auditData) {
    const auditDataDiv = document.getElementById('auditData');
    auditDataDiv.innerHTML = `
        <p>Audit Ratio: ${auditData.auditRatio || 'N/A'}</p>
        <p>Total Up: ${auditData.totalUp || 'N/A'}</p>
        <p>Total Down: ${auditData.totalDown || 'N/A'}</p>
    `;
}

// xp 

async function fetchXPData() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    if (!jwt) {
        console.log('No JWT found for XP query');
        return;
    }

    try {
        const query = `
            query GetXPData {
                user {
                    transactions_aggregate(where: {type: {_eq: "xp"}}) {
                        aggregate {
                            sum {
                                amount
                            }
                        }
                    }
                }
            }
        `;
        
        console.log('Fetching XP data...');
        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('XP Data:', data);

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Error in XP query');
        }

        const xpData = data.data.user[0];
        displayXPData(xpData);

    } catch (error) {
        console.error('Error fetching XP data:', error);
        document.getElementById('xpData').innerText = 'Failed to load XP data.';
    }
}

async function fetchXPData() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    if (!jwt) {
        console.log('No JWT found for XP query');
        return;
    }

    try {
        const query = `
            query GetXPData {
                user {
                    transactions_aggregate(where: {type: {_eq: "xp"}}) {
                        aggregate {
                            sum {
                                amount
                            }
                        }
                    }
                }
            }
        `;
        
        console.log('Fetching XP data...');
        const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('XP Data:', data);

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Error in XP query');
        }

        const xpData = data.data.user[0];
        displayXPData(xpData);

    } catch (error) {
        console.error('Error fetching XP data:', error);
        document.getElementById('xpData').innerText = 'Failed to load XP data.';
    }
}

function displayXPData(xpData) {
    const xpDataDiv = document.getElementById('xpData');
    const totalXP = xpData.transactions_aggregate.aggregate.sum.amount || 0;
    
    // Fixed the regex syntax here - added missing parenthesis
    const formattedXP = totalXP.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Calculate progress towards next level
    const levels = [
        { xp: 0, name: "Beginner" },
        { xp: 10000, name: "Novice" },
        { xp: 30000, name: "Intermediate" },
        { xp: 70000, name: "Advanced" },
        { xp: 150000, name: "Expert" }
    ];
    
    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = 0; i < levels.length - 1; i++) {
        if (totalXP >= levels[i].xp) {
            currentLevel = levels[i];
            nextLevel = levels[i+1] || levels[i]; // Handle case when at max level
        }
    }
    
    // Calculate progress percentage, capped at 100%
    const progress = nextLevel ? 
        Math.min(100, ((totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100) :
        100;
    xpDataDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Total XP:</span>
            <span class="stat-value">${formattedXP}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Level:</span>
            <span class="stat-value">${currentLevel.name}</span>
        </div>
        <div class="xp-progress">
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${progress}%"></div>
            </div>
            <div class="xp-milestone">
                <span>${currentLevel.name} (${currentLevel.xp.toLocaleString()} XP)</span>
                ${nextLevel ? `<span>${nextLevel.name} (${nextLevel.xp.toLocaleString()} XP)</span>` : ''}
            </div>
        </div>
    `;
}
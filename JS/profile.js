document.addEventListener('DOMContentLoaded', () => {
    fetchUserData();
    fetchAuditData();
    fetchXPData();
});

function logout() {
    console.log('Logout button clicked');
    localStorage.removeItem('jwt');
    console.log('JWT removed from localStorage:', localStorage.getItem('jwt'));
    window.location.href = 'index.html';
}

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
        const responseBody = await response.text();
        
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
        document.getElementById('userData').innerHTML = `
            <div class="error">Failed to load user data</div>
            <div>${error.message}</div>
        `;
    }
}

function displayUserData(user) {
    const userDataDiv = document.getElementById('userData');
    userDataDiv.innerHTML = `
        <div class="profile-header">
            <h2>${user.firstName || ''} ${user.lastName || ''}</h2>
            <p class="username">@${user.login}</p>
        </div>
        <div class="profile-details">
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Campus:</strong> ${user.campus || 'N/A'}</p>
            <p><strong>ID:</strong> ${user.id || 'N/A'}</p>
        </div>
    `;
}

async function fetchAuditData() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    if (!jwt) {
        console.log('No JWT found for audit query');
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Audit Data:', data);

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Error in audit query');
        }

        const auditData = data.data.user[0];
        displayAuditData(auditData);

    } catch (error) {
        console.error('Error fetching audit data:', error);
        document.getElementById('auditData').innerHTML = `
            <div class="error">Failed to load audit data</div>
            <div>${error.message}</div>
        `;
    }
}

function formatToKB(bytes) {
    const kb = bytes / 1024;
    return kb >= 1000 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
}

function displayAuditData(auditData) {
    const auditDataDiv = document.getElementById('auditData');
    const ratio = auditData.auditRatio || 0;
    const upKB = formatToKB(auditData.totalUp || 0);
    const downKB = formatToKB(auditData.totalDown || 0);

    auditDataDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Audit Ratio:</span>
            <span class="stat-value ratio-${getRatioClass(ratio)}">${ratio.toFixed(2)}</span>
            <span class="ratio-comment">${getRatioComment(ratio)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Total Up:</span>
            <span class="stat-value">${upKB}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Total Down:</span>
            <span class="stat-value">${downKB}</span>
        </div>
    `;
}

function getRatioClass(ratio) {
    if (ratio >= 1.5) return 'excellent';
    if (ratio >= 1.2) return 'good';
    if (ratio >= 1.0) return 'fair';
    return 'poor';
}

function getRatioComment(ratio) {
    if (ratio >= 1.5) return '(Excellent)';
    if (ratio >= 1.2) return '(Good)';
    if (ratio >= 1.0) return '(Fair)';
    return '(Needs improvement)';
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
        document.getElementById('xpData').innerHTML = `
            <div class="error">Failed to load XP data</div>
            <div>${error.message}</div>
        `;
    }
}

function displayXPData(xpData) {
    const xpDataDiv = document.getElementById('xpData');
    const totalXP = xpData.transactions_aggregate.aggregate.sum.amount || 0;
    const totalKB = (totalXP / 1024).toFixed(2);
    
    const levels = [
        { xp: 0, name: "Beginner", xpKB: 0 },
        { xp: 10240, name: "Novice", xpKB: 10 },
        { xp: 51200, name: "Intermediate", xpKB: 50 },
        { xp: 102400, name: "Advanced", xpKB: 100 },
        { xp: 204800, name: "Expert", xpKB: 200 }
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = 0; i < levels.length - 1; i++) {
        if (totalXP >= levels[i].xp) {
            currentLevel = levels[i];
            nextLevel = levels[i+1] || levels[i];
        }
    }

    const progress = nextLevel ? 
        Math.min(100, ((totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp) * 100)) :
        100;

    xpDataDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Total XP:</span>
            <span class="stat-value">${totalKB} KB</span>
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
                <span>${currentLevel.name} (${currentLevel.xpKB} KB)</span>
                ${nextLevel ? `<span>${nextLevel.name} (${nextLevel.xpKB} KB)</span>` : ''}
            </div>
        </div>
    `;
}
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData(); // Single function to fetch all data
});

function logout() {
    console.log('Logout button clicked');
    localStorage.removeItem('jwt');
    console.log('JWT removed from localStorage:', localStorage.getItem('jwt'));
    window.location.href = 'index.html';
}

async function fetchAllData() {
    const jwt = localStorage.getItem('jwt')?.replace(/^"(.*)"$/, '$1');
    console.log('JWT:', jwt);
    if (!jwt) {
        console.log('No JWT found, redirecting to login...');
        window.location.href = 'index.html';
        return;
    }

    try {
        console.log('Fetching all user data...');
        const query = `
        {
            user {
                id
                login
                firstName
                lastName
                email
                campus
                githubId
                auditRatio
                totalUp
                totalDown
                transactions(order_by: {amount: desc}, where: {type: {_eq: "level"}}, limit: 1) {
                    type
                    amount
                    progress {
                        path
                        createdAt
                        updatedAt
                    }
                    object {
                        name
                        type
                    }
                }
            }
            skills: transaction(where: {type: {_like: "%skill%"}}, order_by: {amount: desc}) {
                amount
                type
                path
                createdAt
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
        console.log('Complete Data:', data);

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            throw new Error(data.errors[0].message || 'Failed to fetch data');
        }

        const userData = data.data.user[0];
        const skillsData = data.data.skills;

        // Display all data
        displayUserData(userData);
        displayAuditData(userData);
        displaySkillsData(skillsData);

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('userData').innerHTML = `
            <div class="error">Failed to load data</div>
            <div>${error.message}</div>
        `;
    }
}

// Keep these display functions the same
function displayUserData(user) {
    const userDataDiv = document.getElementById('userData');
    userDataDiv.innerHTML = `
        <div class="profile-header">
            <h2>${user.firstName || ''} ${user.lastName || ''}</h2>
            <p class="username"><strong>Username:</strong> ${user.login}</p>
        </div>
        <div class="profile-details">
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Campus:</strong> ${user.campus || 'N/A'}</p>
            <p><strong>ID:</strong> ${user.id || 'N/A'}</p>
        </div>
    `;
}

function displayAuditData(auditData) {
    const auditDataDiv = document.getElementById('auditData');
    const ratio = auditData.auditRatio || 0;
    const totalUp = auditData.totalUp || 0;
    const totalDown = auditData.totalDown || 0;

    // Calculate max for normalization
    const max = Math.max(totalUp, totalDown) || 1;
    const upPercent = (totalUp / max) * 100;
    const downPercent = (totalDown / max) * 100;
    console.log('Raw Audit Values:', {
        totalUp: auditData.totalUp,
        totalDown: auditData.totalDown,
        auditRatio: auditData.auditRatio
    });
    
    auditDataDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Audit Ratio:</span>
            <span class="stat-value ratio-${getRatioClass(ratio)}">${ratio.toFixed(2)}</span>
            <span class="ratio-comment">${getRatioComment(ratio)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Audit XP Comparison:</span>
            <div class="chart-bar-container">
                <div class="bar up-bar" style="width: ${upPercent}%" title="Up: ${formatToKB(totalUp)}"></div>
                <div class="bar down-bar" style="width: ${downPercent}%" title="Down: ${formatToKB(totalDown)}"></div>
            </div>
            <div class="chart-labels">
                <span class="up-label">Up: ${formatToKB(totalUp)}</span>
                <span class="down-label">Down: ${formatToKB(totalDown)}</span>
            </div>
        </div>
    `;
}
function formatToKB(bytes) {
    const kb = bytes / 1024;
    return kb >= 1000 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
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

// New function to display skills data
function displaySkillsData(skills) {
    const skillsDiv = document.getElementById('xpData'); // Reusing the same div
    if (!skills || skills.length === 0) {
        skillsDiv.innerHTML = '<div class="error">No skills data available</div>';
        return;
    }

    // Group skills by type and sum their amounts
    const skillGroups = skills.reduce((acc, skill) => {
        const skillType = skill.type.replace('_skill', '').replace(/_/g, ' ');
        acc[skillType] = (acc[skillType] || 0) + skill.amount;
        return acc;
    }, {});

    // Convert to array and sort by amount
    const sortedSkills = Object.entries(skillGroups)
        .map(([type, amount]) => ({ type, amount }))
        .sort((a, b) => b.amount - a.amount);

    // Create HTML for skills display
    const skillsHTML = `
        <h3>Skills</h3>
        <div class="skills-container">
            ${sortedSkills.map(skill => `
                <div class="skill-item">
                    <span class="skill-name">${skill.type}</span>
                    <span class="skill-amount">${skill.amount} XP</span>
                </div>
            `).join('')}
        </div>
    `;

    skillsDiv.innerHTML = skillsHTML;
}
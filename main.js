document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Encode credentials in Base64
    const credentials = btoa(`${username}:${password}`);
  
    try {
      const response = await fetch('https://((DOMAIN))/api/auth/signin', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
  
      const data = await response.json();
      const jwt = data.token;
  
      // Store JWT in localStorage
      localStorage.setItem('jwt', jwt);
  
      // Redirect to profile page
      window.location.href = '/profile.html';
    } catch (error) {
      document.getElementById('error-message').textContent = error.message;
    }
  });
  const jwt = localStorage.getItem('jwt');

if (!jwt) {
  window.location.href = '/index.html'; // Redirect to login if no JWT
}

// Fetch user data
fetchUserData();

async function fetchUserData() {
  const query = `
    {
      user {
        id
        login
        email
      }
      transaction(where: { type: { _eq: "xp" } }) {
        amount
      }
    }
  `;

  const response = await fetch('https://((DOMAIN))/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  const user = data.data.user[0];
  const xpTransactions = data.data.transaction;

  // Display user data
  document.getElementById('username').textContent = user.login;
  document.getElementById('email').textContent = user.email;
  document.getElementById('total-xp').textContent = xpTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Render graphs
  renderGraphs(xpTransactions);
}

function renderGraphs(transactions) {
  const graphContainer = document.getElementById('graphs');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '400');
  svg.setAttribute('height', '200');

  // Example: Create a bar chart for XP over time
  transactions.forEach((t, i) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', i * 50);
    rect.setAttribute('y', 200 - t.amount);
    rect.setAttribute('width', '40');
    rect.setAttribute('height', t.amount);
    rect.setAttribute('fill', 'blue');
    svg.appendChild(rect);
  });

  graphContainer.appendChild(svg);
}

// Logout
document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('jwt');
  window.location.href = '/index.html';
});
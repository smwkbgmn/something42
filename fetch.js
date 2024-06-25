const clientId = 'u-s4t2ud-9063f4e8ff01e5b0878f85b3cc0434661267ebbee2ae65bcba9fc2a973a6584e';
const redirectUri = 'https://smwkbgmn.github.io/somthing42/';
let accessToken = "e35ee41075bd76a5cb87df17f82cfa8da4fe4ef870621fcee5af10bacbe4c243";

document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('fetchButton').addEventListener('click', fetchData);

function login() {
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public`;
    window.location.href = authUrl;
}

function handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    accessToken = params.get('access_token');

    if (accessToken) {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('fetchButton').style.display = 'inline-block';
    }
}

function fetchData() {
    const category = document.getElementById('categorySelect').value;
    const apiUrl = `https://api.intra.42.fr/v2/${category}`;

    fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayData(data))
    .catch(error => console.error('Error fetching data:', error));
}

function displayData(data) {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = '';

    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.id;
        dataList.appendChild(li);
    });
}

// Run handleCallback on page load to process the access token if redirected from the OAuth flow
window.onload = handleCallback;

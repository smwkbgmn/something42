const clientId = 'u-s4t2ud-9063f4e8ff01e5b0878f85b3cc0434661267ebbee2ae65bcba9fc2a973a6584e';
const redirectUri = 'https://smwkbgmn.github.io/somthing42/';
// const corsProxy = 'https://something42-d4bd81072306.herokuapp.com/proxy?url=';
const corsProxy = 'https://something42.herokuapp.com/';
let accessToken = "ce64ad4fcea7a04e24a2f06b78b6c4c755faedc3a23ba591f1d691244fe09c96";

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
    const fullUrl = corsProxy + encodeURIComponent(apiUrl);

    fetch(fullUrl, {
        headers: {
            'Authorization': `Bearer ce64ad4fcea7a04e24a2f06b78b6c4c755faedc3a23ba591f1d691244fe09c96`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => displayData(data))
    .catch(error => console.error('Error fetching data:', error));
}

// function fetchData() {
//     const category = document.getElementById('categorySelect').value;
//     const apiUrl = `https://api.intra.42.fr/v2/${category}`;
//     const fullUrl = corsProxy + encodeURIComponent(apiUrl);

//     fetch(fullUrl, {
//         headers: {
//             'Authorization': `Bearer ${accessToken}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => displayData(data))
//     .catch(error => console.error('Error fetching data:', error));
// }

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

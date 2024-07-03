const clientId = 'u-s4t2ud-9063f4e8ff01e5b0878f85b3cc0434661267ebbee2ae65bcba9fc2a973a6584e';
const redirectUri = 'https://smwkbgmn.github.io/somthing42/';
// const corsProxy = 'https://cors-anywhere.herokuapp.com/';
// const corsProxy = 'https://something42-d4bd81072306.herokuapp.com/proxy?url=';
const corsProxy = 'https://something42-d4bd81072306.herokuapp.com/';

document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('fetchButton').addEventListener('click', fetchData);

function login() {
	
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public`;
    window.location.href = authUrl;

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const accessToken = urlParams.get('code');

	function cleanURL() {
		// Get the current URL
		let currentURL = new URL(window.location.href);
		
		// Create a new URL with just the origin and pathname
		let cleanURL = currentURL.origin + currentURL.pathname;
		
		// Use replaceState to update the URL without reloading the page
		window.history.replaceState({}, document.title, cleanURL);
	}
	
	// Call this function after you've processed the OAuth token
	cleanURL();

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
    // const apiUrl = `https://api.intra.42.fr/v2/${category}`;
	const apiUrl = `api.intra.42.fr:443/v2/${category}`;
    // const fullUrl = corsProxy + encodeURIComponent(apiUrl);
	const fullUrl = corsProxy + apiUrl;

    fetch(fullUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
			'Origin': 'https://smwkbgmn.github.io'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
		console.log('Received data:', data);
		displayData(data);
	})
    .catch(error => console.error('Error fetching data:', error));
}

function displayData(data) {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = '';

    if (Array.isArray(data)) {
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.id;
            dataList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = `ID: ${data.id}, Name: ${data.name || 'N/A'}`;
        dataList.appendChild(li);
    }
}

// Run handleCallback on page load to process the access token if redirected from the OAuth flow
window.onload = handleCallback;

const clientId = 'u-s4t2ud-9063f4e8ff01e5b0878f85b3cc0434661267ebbee2ae65bcba9fc2a973a6584e';
const redirectUri = 'https://smwkbgmn.github.io/somthing42/';
/*	Has issue with redirect uri and LiveServer
	After login the response from 42Auth redirect url to Github pages
	But if we change above code with something like https://localhost:5500(liveserver)
	42auth send us "invalid redirect url"
	No way to test with LiveServer after login 
*/
let accessToken = "ce64ad4fcea7a04e24a2f06b78b6c4c755faedc3a23ba591f1d691244fe09c96";

document.getElementById('loginButton').addEventListener('click', login);
// document.getElementById('fetchButton').addEventListener('click', fetchData);
const categorySelect = document.getElementById('categorySelect');
const fetchButton = document.getElementById('fetchButton');
const dataList = document.getElementById('dataList');

//////////// Bypass Github-pages CORS issues ///////////////
// const corsProxy = 'https://cors-anywhere.herokuapp.com/';
// const apiUrl = `https://api.intra.42.fr/v2/${selectedCategory}`;
// const fullUrl = corsProxy + apiUrl;

// fetch(fullUrl, {
//     headers: {
//         'Authorization': `Bearer ${accessToken}`
//     }2
// })
// .then(response => response.json())
// .then(data => displayData(data))
// .catch(error => console.error('Error fetching data:', error));
//////////////////////////////////////////////////////////////

function login() {
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public`;
    window.location.href = authUrl;
}

fetchButton.addEventListener('click', () => {
	const selectedCategory = categorySelect.value;
  
	/* CORS bypssing */
	const corsProxy = 'https://cors-anywhere.herokuapp.com/';
	// const corsProxy = 'https://something42.herokuapp.com/proxy?url=';

	const apiUrl = `https://api.intra.42.fr/v2/${selectedCategory}`;
	const fullUrl = corsProxy + apiUrl;
	
	// const category = document.getElementById('categorySelect').value;
	// const apiUrl = `https://api.intra.42.fr/v2/${category}`;
	// const fullUrl = corsProxy + encodeURIComponent(apiUrl);
	
	fetch(fullUrl, {
		headers: {
			// 'Authorization': `Bearer ${accessToken}`
			'Authorization': `Bearer ce64ad4fcea7a04e24a2f06b78b6c4c755faedc3a23ba591f1d691244fe09c96`
			}
		})
		.then(response => response.json())
		.then(data => displayData(data))
		.catch(error => console.error('Error fetching data:', error));
	
	/* Origin */
 // fetch(`https://api.intra.42.fr/v2/projects_users?filter[project.name]=${selectedCategory}`, {
	// 	fetch(`https://api.intra.42.fr/v2/${selectedCategory}`, {
	//   headers: {
	// 	// 'Authorization': `Bearer ${accessToken}`
		// 'Authorization': `Bearer ce64ad4fcea7a04e24a2f06b78b6c4c755faedc3a23ba591f1d691244fe09c96`
	//   }
	// })
	//   .then(response => response.json())
	//   .then(data => {
	// 	dataList.innerHTML = '';
	// 	data.forEach(item => {
	// 	  const li = document.createElement('li');
	// 	  li.textContent = item.user.login;
	// 	  dataList.appendChild(li);
	// 	});
	//   })
	//   .catch(error => {
	// 	console.error('Error:', error);
	//   });

  });

function handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    accessToken = params.get('access_token');

    if (accessToken) {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('fetchButton').style.display = 'inline-block';
    }
}

// function fetchData() {
//     const category = document.getElementById('categorySelect').value; // What is this line?
//     const apiUrl = `https://api.intra.42.fr/v2/${category}`;

//     fetch(apiUrl, {
//         headers: {
//             'Authorization': `Bearer ${accessToken}` // This is where we got the auth to give to the client.
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

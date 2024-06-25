import auth2 from "simple-oauth2"



document.getElementById('fetchButton').addEventListener('click', fetchIds);

function fetchIds() {
	const myHeaders = new Headers();
	myHeaders.append("Cookie", "_intra_42_session_production=ce74e724222cf2f7d563e005191578ce");

	const requestOptions = {
	  method: "GET",
	  headers: myHeaders,
	  redirect: "follow",
	  modo: "cors"
	};

	fetch("https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ea1f8d209fe0b6bde730011e41f792f77737f9eb5f80a428e93ed76351f8e2b4&redirect_uri=https%3A%2F%2Fsmwkbgmn.github.io%2Fsomthing42%2F&response_type=code", requestOptions)
	  .then((response) => response.json())
	  .then((result) => console.log(result))
	  .catch((error) => console.error(error));
}

/*
	1. we have permission to get the 42 data with 42 account (student) 

	2. send GET request for getting the authrization 
	- URL: GET https://api.intra.42.fr/oauth/authorize
	- response is give with query

	DON'T NEED? (works without this steps when request the access token via
	curl -X POST --data "grant_type=client_credentials&client_id=API_UID&client_secret=API_SECRETE" https://api.intra.42.fr/oauth/token)
	---------------------------------------------------------------------------

	3. send POST request for geeting the accesstoken based with the auth before granted
	as a result we get the access token and endpoint
	- URL: POST https://api.intra.42.fr/oauth/token
	- response: {"access_token":"key_value","token_type":"bearer","expires_in":7200,"scope":"public","created_at":value,"secret_valid_until":value}%

	4. API request
	- add Auturization header the "Authorization: Bearer YOUR_ACCESS_TOKEN"
*/ 

// curl -X POST --data "grant_type=client_credentials&client_id=MY_AWESOME_UID&client_secret=MY_AWESOME_SECRET" https://api.intra.42.fr/oauth/token

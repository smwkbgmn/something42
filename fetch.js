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
	  .then((response) => response.text())
	  .then((result) => console.log(result))
	  .catch((error) => console.error(error));
}

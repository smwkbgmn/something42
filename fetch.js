document.getElementById('fetchButton').addEventListener('click', fetchIds);

function fetchIds() {
    const apiUrl = 'https://jsonplaceholder.typicode.com/posts'; // Example API endpoint

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const idList = document.getElementById('idList');
            idList.innerHTML = ''; // Clear any existing list items

            data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `ID: ${item.id}`;
                idList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

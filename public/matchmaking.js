document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // This uses the global io function provided by the Socket.IO client script
    const findMatchButton = document.getElementById('findMatch');
    const statusDiv = document.getElementById('status');

	if (findMatchButton) {

		findMatchButton.addEventListener('click', () => {
			statusDiv.textContent = 'Searching for a match...';
			socket.emit('requestMatch');
		});
		
	}

    socket.on('waitingForOpponent', () => {
        statusDiv.textContent = 'Waiting for an opponent...';
    });

    socket.on('matchFound', ({ roomId }) => {
        statusDiv.textContent = 'Match found! Starting game...';
        window.location.href = `/game.html?roomId=${roomId}`;
    });
});
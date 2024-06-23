const statusElement = document.getElementById('api-status');
const requestList = document.getElementById('request-list');

// Determinar la URL de WebSocket correcta
const socketUrl = window.location.protocol === 'https:' ? `wss://${window.location.host}` : `ws://${window.location.host}`;

// Conectar a WebSocket
const socket = new WebSocket(socketUrl);

socket.onopen = () => {
  console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.status) {
    if (data.status === 'OK') {
      statusElement.textContent = 'OK';
      statusElement.classList.remove('status-checking', 'status-error');
      statusElement.classList.add('status-ok');
    } else {
      statusElement.textContent = 'Error';
      statusElement.classList.remove('status-checking', 'status-ok');
      statusElement.classList.add('status-error');
    }
  }

  if (data.requests) {
    requestList.innerHTML = '';
    data.requests.forEach(req => {
      const li = document.createElement('li');
      li.textContent = `${req.method} ${req.url} - ${new Date(req.time).toLocaleString()}`;
      requestList.appendChild(li);
    });
  }
};

socket.onclose = () => {
  console.log('WebSocket connection closed');
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};
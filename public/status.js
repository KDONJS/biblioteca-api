const statusElement = document.getElementById('api-status');
const requestList = document.getElementById('request-list');

// Conectar a WebSocket
const socket = new WebSocket(`ws://${window.location.host}`);

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
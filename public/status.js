const statusElement = document.getElementById('api-status');
const requestList = document.getElementById('request-list');

const eventSource = new EventSource('/status');

eventSource.onmessage = (event) => {
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

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
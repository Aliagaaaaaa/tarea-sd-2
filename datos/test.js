fetch('http://localhost:3000/solicitar', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: 'Sweet Potato',
        email: 'maliagapacheco@gmail.com'
    }),
}).then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));

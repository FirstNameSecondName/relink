document.getElementById('generateForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const url = document.getElementById('url').value;

    const response = await fetch('/generate-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url })
    });
	console.log(response.status, response.statusText);
	console.log(await response.text());
    if (response.ok) {
        const data = await response.json();
        alert(`Generated Link: https://coturntest.mooo.com/${data.hash}`);
    } else {
        alert('Failed to generate link.');
    }
});
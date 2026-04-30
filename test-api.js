const axios = require('axios');

async function testApi() {
  try {
    const resources = await axios.get('http://localhost:8080/api/resources');
    const tickets = await axios.get('http://localhost:8080/api/tickets');
    const bookings = await axios.get('http://localhost:8080/api/bookings');

    console.log('RESOURCES:', resources.data.length);
    if(resources.data.length > 0) {
        console.log('Sample Resource Type:', resources.data[0].resourceType);
        const types = new Set(resources.data.map(r => r.resourceType));
        console.log('All types:', Array.from(types));
    }

    console.log('TICKETS:', tickets.data.length);
    if(tickets.data.length > 0) {
        console.log('Ticket Statuses:', Array.from(new Set(tickets.data.map(t => t.status))));
    }

    console.log('BOOKINGS:', bookings.data.length);
  } catch (err) {
    console.error('Error calling API', err.message);
  }
}

testApi();

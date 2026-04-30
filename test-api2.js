async function testApi() {
  try {
    const resR = await fetch('http://localhost:8080/api/resources');
    const resources = await resR.json();
    
    const resT = await fetch('http://localhost:8080/api/tickets');
    const tickets = await resT.json();
    
    const resB = await fetch('http://localhost:8080/api/bookings');
    const bookings = await resB.json();

    console.log('RESOURCES:', resources.length);
    if(resources.length > 0) {
        console.log('Sample Resource Type:', resources[0].resourceType);
        const types = new Set(resources.map(r => r.resourceType));
        console.log('All types:', Array.from(types));
    }

    console.log('TICKETS:', tickets.length);
    if(tickets.length > 0) {
        console.log('Ticket Statuses:', Array.from(new Set(tickets.map(t => t.status))));
    }

    console.log('BOOKINGS:', bookings.length);
  } catch (err) {
    console.error('Error calling API', err.message);
  }
}

testApi();

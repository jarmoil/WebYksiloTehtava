const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// A function that is called when location information is retrieved
async function success(pos) {
  const crd = pos.coords;

  // Use the leaflet.js library to show the location on the map (https://leafletjs.com/)
  const map = L.map('map').setView([crd.latitude, crd.longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add a marker for the user's location
  L.marker([crd.latitude, crd.longitude]).addTo(map)
    .bindPopup('I am here.')
    .openPopup();

    var circle = L.circle([crd.latitude, crd.longitude], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
  }).addTo(map);

  // Fetch restaurant data
  const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants');
  const restaurants = await response.json();

  // Add markers for all restaurants
  restaurants.forEach(restaurant => {
    const [longitude, latitude] = restaurant.location.coordinates;
    const marker = L.marker([latitude, longitude]).addTo(map)
      .bindPopup(`<strong>${restaurant.name}</strong><br>${restaurant.address}, ${restaurant.city}`);

    // Add click event to highlight the corresponding restaurant in the table
    marker.on('click', () => {
      // Remove highlight from all rows
      document.querySelectorAll('#target tr').forEach(row => row.classList.remove('highlight'));

      // Find the corresponding row in the table
      const rows = document.querySelectorAll('#target tr');
      rows.forEach(row => {
        if (row.querySelector('td') && row.querySelector('td').innerText === restaurant.name) {
          row.classList.add('highlight'); // Add highlight class
          row.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the row
        }
      });
    });
  });
}

// Function to be called if an error occurs while retrieving location information
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Starts the location search
navigator.geolocation.getCurrentPosition(success, error, options);

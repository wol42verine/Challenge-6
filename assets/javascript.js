// linking form to api
document.getElementById('city-search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    const city = document.getElementById('city-search').value;
    console.log(`fetching weather for city: ${city}`);
    getCoordinates(city)
        .then(({ latitude, longitude }) => getWeather(latitude, longitude))
        .then(data => displayWeather(data))
        .catch(error => console.error('Error fetching weather data:', error));
});

const apiKey = '6de317a2973310e182e224e0035de19d';

// Function to get latitude and longitude coordinates for a given city
function getCoordinates(city) {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch coordinates');
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                return { latitude: lat, longitude: lon };
            } else {
                throw new Error('City not found');
            }
        });
}

// Function to get weather data using latitude and longitude coordinates
function getWeather(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            return response.json();
        });
}

// displaying city data
function displayWeather(data) {
    const cityNameElement = document.getElementById('city-name');
    const cityDetailsElement = document.getElementById('city-details');
    if (cityNameElement && cityDetailsElement) {
        const cityName = data.name;
        const temperature = data.main.temp;
        const weather = data.weather[0].description;
        const humidity = data.main.humidity;

        cityNameElement.textContent = cityName;
        cityDetailsElement.innerHTML = `
            <p>Temperature: ${temperature} °C</p>
            <p>Weather: ${weather}</p>
            <p>Humidity: ${humidity}%</p>
        `;
    } else {
        console.error('City name or details element not found in the DOM.');
    }
}

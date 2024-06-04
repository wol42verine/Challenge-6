// linking form to api
document.getElementById('city-search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    const city = document.getElementById('city-search').value;
    console.log(`fetching weather for city: ${city}`);
    getCoordinates(city)
        .then(({ latitude, longitude }) => {
            return Promise.all([
                getWeather(latitude, longitude),
                getForecast(latitude, longitude)
            ]);
        })
        .then(([weatherData, forecastData]) => {
            displayWeather(weatherData);
            displayForecast(forecastData);
        })
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

// Function to get 5-day forecast data using latitude and longitude coordinates
function getForecast(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            return response.json();
        });
}

// Function to display the 5-day forecast with data for 12 noon only
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer) {
        forecastContainer.innerHTML = ''; // Clear previous forecast data
        
        // Filter forecast data to include only 12 noon for each day
        const filteredForecast = filterForecastForNoon(forecastData.list);

        // Iterate through filtered forecast data and create a card for each day
        for (const [date, forecasts] of Object.entries(filteredForecast)) {
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');
            forecastCard.innerHTML = `<h3>${date}</h3>`;
            forecasts.forEach(forecast => {
                const time = new Date(forecast.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const temperature = forecast.main?.temp; // Use optional chaining to handle undefined properties
                const weather = forecast.weather[0]?.description; // Use optional chaining to handle undefined properties
                if (temperature !== undefined && weather !== undefined) {
                    const forecastItem = document.createElement('div');
                    forecastItem.classList.add('forecast-item');
                    forecastItem.innerHTML = `
                        <p>${time}</p>
                        <p>Temperature: ${temperature} °C</p>
                        <p>Weather: ${weather}</p>
                    `;
                    forecastCard.appendChild(forecastItem);
                }
            });
            forecastContainer.appendChild(forecastCard);
        }
    } else {
        console.error('Forecast container not found in the DOM.');
    }
}

// Function to filter forecast data to include only 12 noon for each day
function filterForecastForNoon(forecastList) {
    const filteredForecast = {};
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US');
        const time = new Date(forecast.dt * 1000).getHours();
        if (time >= 11 && time <= 13) { // Check for timestamps between 11 AM and 1 PM
            if (!filteredForecast[date]) {
                filteredForecast[date] = [];
            }
            filteredForecast[date].push(forecast);
        }
    });
    return filteredForecast;
}

// displaying city data
function displayWeather(data) {
    const currentWeatherCard = document.getElementById('current-weather-card');
    if (currentWeatherCard) {
        const cityName = data.name;
        const temperature = data.main.temp;
        const weather = data.weather[0].description;
        const humidity = data.main.humidity;

        currentWeatherCard.innerHTML = `
            <h3>${cityName}</h3>
            <p>Temperature: ${temperature} °C</p>
            <p>Weather: ${weather}</p>
            <p>Humidity: ${humidity}%</p>
        `;
    } else {
        console.error('Current weather card not found in the DOM')

    }
}
document.getElementById('city-search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    const city = document.getElementById('city-search').value;
    if (city) {
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
                saveCity(city); // Save the city
                displaySavedCities(); // Display saved cities
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }
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

// Function to display the 5-day forecast
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer) {
        forecastContainer.innerHTML = ''; // Clear previous forecast data

        // Filter forecast data 
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
                const iconCode = forecast.weather[0]?.icon; // Weather icon code
                const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`; // Weather icon URL
                const windSpeed = forecast.wind?.speed; // New property
                const humidity = forecast.main?.humidity; // New property
                if (temperature !== undefined && weather !== undefined && windSpeed !== undefined && humidity !== undefined) {
                    const forecastItem = document.createElement('div');
                    forecastItem.classList.add('forecast-item');
                    forecastItem.innerHTML = `
                        <p>${time}</p>
                        <img src="${iconUrl}" alt="${weather}">
                        <p>Temperature: ${temperature} °C</p>
                        <p>Weather: ${weather}</p>
                        <p>Wind: ${windSpeed} m/s</p>
                        <p>Humidity: ${humidity}%</p>
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

// Function to filter forecast data 
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

// Function to display city data
function displayWeather(data) {
    const currentWeatherCard = document.getElementById('current-weather-card');
    if (currentWeatherCard) {
        const cityName = data.name;
        const date = new Date(data.dt * 1000).toLocaleDateString('en-US'); // Convert timestamp to date string
        const temperature = data.main.temp;
        const weather = data.weather[0].description;
        const iconCode = data.weather[0].icon; // Weather icon code
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`; // Weather icon URL
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        currentWeatherCard.innerHTML = `
            <h3>${cityName} (${date})</h3> <!-- Display city name and date --></h3>
            <img src="${iconUrl}" alt="${weather}">
            <p>Temperature: ${temperature} °C</p>
            <p>Weather: ${weather}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind: ${windSpeed} m/s</p>
        `;
    } else {
        console.error('Current weather card not found in the DOM');
    }
}

// Function to save city to localStorage
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('savedCities', JSON.stringify(cities));
    }
}

// Function to display saved cities
function displaySavedCities() {
    const savedCitiesList = document.getElementById('saved-cities-list');
    savedCitiesList.innerHTML = ''; // Clear previous list
    savedCitiesList.classList.add('saved-cities-list'); // Add class to the container
    const cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    cities.forEach(city => {
        const cityButton = document.createElement('button'); // Create a button element
        cityButton.textContent = city; // Set the button text content to the city name
        cityButton.addEventListener('click', function () {
            document.getElementById('city-search').value = city;
            document.getElementById('city-search-form').dispatchEvent(new Event('submit'));
        });
        savedCitiesList.appendChild(cityButton); // Append the button to the saved cities list
    });
}

// Display saved cities on page load
window.addEventListener('load', displaySavedCities); // New event listener

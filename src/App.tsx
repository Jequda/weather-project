import React, { useState, useEffect } from 'react'

import { fetchForecast, fetchNearestCity } from './api'
import './App.css'
import { ForecastData } from './types'

function App() {
  const [city, setCity] = useState('Москва')
  const [forecast, setForecast] = useState<{
    [key: string]: ForecastData[]
  } | null>(null)
  const [cityName, setCityName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const nearestCity = await fetchNearestCity(
                position.coords.latitude,
                position.coords.longitude
              )
              setCity(nearestCity)
            } catch (error) {
              setError('Ошибка при определении ближайшего города.')
              console.error(error)
            }
          },
          (error) => {
            setError(
              'Невозможно получить геопозицию. Разрешите доступ к геопозиции или попробуйте ввести город самостоятельно.'
            )
            console.error(error)
          }
        )
      } else {
        setError(
          'Геолокация недоступна в вашем браузере. Воспользуйтесь другим браузером или попробуйте ввести город самостоятельно'
        )
      }
    }

    fetchUserLocation()
  }, [])

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await fetchForecast(city)

        if (!data || !data.list) {
          throw new Error('Не удалось получить данные о прогнозе.')
        }

        const groupedForecast = data.list.reduce(
          (acc, entry) => {
            const date = entry.dt_txt.split(' ')[0]
            if (!acc[date]) acc[date] = []
            acc[date].push(entry)
            return acc
          },
          {} as { [key: string]: ForecastData[] }
        )

        setForecast(groupedForecast)
        setCityName(`${data.city.name}, ${data.city.country}`)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Произошла неизвестная ошибка при загрузке прогноза.')
        }
        setForecast(null)
        setCityName(null)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadForecast()
  }, [city])

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value)
  }

  return (
    <div className="weather-container">
      <h1>Прогноз погоды на 5 дней</h1>
      <input
        type="text"
        value={city}
        onChange={handleCityChange}
        placeholder="Введите название города"
        className="city-input"
      />
      {loading ? (
        <h2>Загрузка...</h2>
      ) : error ? (
        <p className="error">{error}</p>
      ) : forecast ? (
        <div>
          {cityName && <h2 className="city-name">{cityName}</h2>}
          <div className="forecast">
            {Object.keys(forecast).map((date, index) => (
              <div key={index} className="day">
                <h3>{new Date(date).toLocaleDateString()}</h3>
                <div className="hourly-forecast">
                  {forecast[date].map((entry, idx) => (
                    <div key={idx} className="hour">
                      <p>
                        Прогноз на{' '}
                        {new Date(entry.dt_txt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p>Температура: {Math.floor(entry.main.temp)}°C</p>
                      <p>Влажность: {entry.main.humidity}%</p>
                      <p>Ветер: {Math.floor(entry.wind.speed)} м/с</p>
                      <div className="description">
                        <img
                          src={`http://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`}
                          alt={entry.weather[0].description}
                          className="weather-icon"
                        />
                        <p>{entry.weather[0].description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App

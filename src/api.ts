import { WeatherResponse } from './types'

const API_KEY = '5c90f5a885082d77a0989f9b8f6e89d0'
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast'

export const fetchForecast = async (city: string): Promise<WeatherResponse> => {
  const response = await fetch(
    `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
  )

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? 'Город не найден.' : 'Ошибка в загрузке данных.'
    )
  }

  const data: WeatherResponse = await response.json()
  return data
}

export const fetchNearestCity = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  const response = await fetch(
    `https://api.sypexgeo.net/?lat=${latitude}&lon=${longitude}`
  )
  if (!response.ok) {
    throw new Error('Ошибка получения данных от Sypex Geo')
  }

  const data = await response.json()
  if (data.city && data.city.name_ru) {
    return data.city.name_ru
  } else {
    throw new Error('Не удалось определить ближайший город.')
  }
}

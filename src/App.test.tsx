import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'

import * as api from './api'
import App from './App'
import { WeatherResponse } from './types'

const mockForecastData: WeatherResponse = {
  list: [
    {
      dt_txt: '2024-08-20 12:00:00',
      main: {
        temp: 25,
        humidity: 60,
      },
      weather: [
        {
          description: 'облачно с прояснениями',
          icon: '01d',
        },
      ],
      wind: {
        speed: 3.5,
      },
    },
  ],
  city: {
    name: 'Лондон',
    country: 'GB',
  },
}

jest.mock('./api')

describe('Тест погоды', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('изменение города при вводе в поле ввода без прогноза', async () => {
    ;(api.fetchForecast as jest.Mock).mockResolvedValueOnce(mockForecastData)
    act(() => {
      render(<App />)
    })

    fireEvent.change(screen.getByPlaceholderText('Введите название города'), {
      target: { value: 'Санкт-Петербург' },
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue('Санкт-Петербург')).toBeInTheDocument()
    })
  })
  test('проверка fetch запроса и отображение погоды', async () => {
    ;(api.fetchForecast as jest.Mock).mockResolvedValue(mockForecastData)

    render(<App />)

    console.log(App)
    await waitFor(() => {
      const cityNameElement = screen.getByText(/Лондон, GB/i)
      expect(cityNameElement).toBeInTheDocument()
    })
  })

  test('отработка ошибки', async () => {
    ;(api.fetchForecast as jest.Mock).mockRejectedValue(
      new Error('Ошибка в загрузке данных.')
    )

    render(<App />)

    await waitFor(() => {
      const errorElement = screen.getByText(/Ошибка в загрузке данных./i)
      expect(errorElement).toBeInTheDocument()
    })
  })
})

export type ForecastData = {
  dt_txt: string
  main: {
    temp: number
    humidity: number
  }
  weather: {
    description: string
    icon: string
  }[]
  wind: {
    speed: number
  }
}

export type WeatherResponse = {
  list: ForecastData[]
  city: {
    name: string
    country: string
  }
}

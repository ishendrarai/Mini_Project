import axios from 'axios'

export const API = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 5000,
})

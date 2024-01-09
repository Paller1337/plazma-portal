import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

const cookieJar = new CookieJar()
const bnovoClient = wrapper(axios.create({ jar: cookieJar, withCredentials: true }))

export default bnovoClient
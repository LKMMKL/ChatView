import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'
const ACCOUNT_NAME = 'ACCOUNT'

export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}
export function setAccount(token: string) {
  return ss.set(ACCOUNT_NAME, token)
}
export function removeToken() {
  return ss.remove(LOCAL_NAME)
}

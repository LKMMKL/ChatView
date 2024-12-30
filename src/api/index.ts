import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    msgId?: string
    system: string
    usingContext: boolean
    userContext?: { user?: boolean; text?: string }[]
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  // const settingStore = useSettingStore()
  return post<T>({
    url: 'https://datapeanut.com/call_with_message_stream/',
    data: { system: params.system, prompt: params.prompt, msgId: params.msgId, options: params.options, systemMessage: params.system, userContext: params.userContext, usingContext: params.usingContext },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

// export function fetchChatAPIProcess<T = any>(
// 	params: {
// 		system: string,
// 		usingContext: boolean,
// 		userContext?: { user?: boolean; text?: string }[],
// 		prompt: string,
// 		options?: { conversationId?: string; parentMessageId?: string },
// 		signal?: GenericAbortSignal
// 	}
// ) {
// 	const url = 'https://datapeanut.com/call_with_message_stream/'
// 	return new EventSource(`${url}?system=${encodeURIComponent(params.system)}&prompt=${encodeURIComponent(params.prompt)}&options=${encodeURIComponent(JSON.stringify(params.options))}&userContext=${encodeURIComponent(JSON.stringify(params.userContext))}&usingContext=${encodeURIComponent(JSON.stringify(params.usingContext))}`)
// }

export function fetToken<T>(wxcode: string) {
  return post<T>({
    url: 'https://datapeanut.com/wechat_login_callback_peanutai/',
    data: { code: wxcode },

  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

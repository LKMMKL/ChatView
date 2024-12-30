import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import { t } from '@/locales'
import { useChatStore } from '@/store'

export function useUsingContext() {
  const ms = useMessage()
  const chatStore = useChatStore()
  const usingContext = computed<boolean>(() => chatStore.usingContext)

  function toggleUsingContext() {
    const uuid = chatStore.getChatHistoryByCurrentActive!.uuid
    chatStore.setUsingContext(!usingContext.value)
    chatStore.clearChatByUuid(+uuid)
    if (usingContext.value)
      ms.success(t('chat.turnOnContext'))
    else
      ms.warning(t('chat.turnOffContext'))
  }

  return {
    usingContext,
    toggleUsingContext,
  }
}

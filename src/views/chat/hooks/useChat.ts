import { useChatStore } from '@/store'

export function useChat() {
  const chatStore = useChatStore()

  const getChatByUuidAndIndex = (uuid: number, index: number) => {
    return chatStore.getChatByUuidAndIndex(uuid, index)
  }

  const addChat = (uuid: number, chat: Chat.Chat) => {
    chatStore.addChatByUuid(uuid, chat)
  }

  const updateChat = (uuid: number, index: number, chat: Chat.Chat) => {
    chatStore.updateChatByUuid(uuid, index, chat)
  }

  const updateChatSome = (uuid: number, index: number, chat: Partial<Chat.Chat>) => {
    chatStore.updateChatSomeByUuid(uuid, index, chat)
  }
  const getChats = (uuid: number, limit: number) => {
    const chats = chatStore.getChatByUuid(uuid)
    if (chats.length > 20)
      return chats.slice(chats.length - 20, chats.length - 1)

    return chats
  }
  return {
    addChat,
    updateChat,
    updateChatSome,
    getChatByUuidAndIndex,
    getChats,
  }
}

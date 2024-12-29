<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { NAutoComplete, NButton, NInput, NTag, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { v4 as uuidv4 } from 'uuid'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, usePromptStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'
import post from '@/utils/request'
let controller = new AbortController()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()

const chatStore = useChatStore()

useCopyCode()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex, getChats } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

const { uuid } = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
const systemRef = computed(() => chatStore.getSystemByuuid(+uuid))

// 添加PromptStore
const promptStore = usePromptStore()

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

function handleSubmit() {
  onConversation()
}
function transform(chats: Chat.Chat[]) {
  return chats.map(({ user, text }) => ({ user, text })).filter(chat => chat.text != '')
}

// async function onConversation() {
// 	let message = prompt.value
//
// 	if (loading.value)
// 		return
//
// 	if (!message || message.trim() === '')
// 		return
//
// 	controller = new AbortController()
//
// 	addChat(
// 		+uuid,
// 		{
// 			dateTime: new Date().toLocaleString(),
// 			text: message,
// 			inversion: true,
// 			error: false,
// 			conversationOptions: null,
// 			requestOptions: { prompt: message, options: null },
// 			user: true,
// 			delete: false,
// 		},
// 	)
// 	scrollToBottom()
//
// 	loading.value = true
// 	prompt.value = ''
//
// 	let options: Chat.ConversationRequest = {}
// 	const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions
//
// 	if (lastContext && usingContext.value)
// 		options = { ...lastContext }
//
// 	addChat(
// 		+uuid,
// 		{
// 			dateTime: new Date().toLocaleString(),
// 			text: '',
// 			loading: true,
// 			inversion: false,
// 			error: false,
// 			conversationOptions: null,
// 			requestOptions: { prompt: message, options: { ...options } },
// 			user: true,
// 			delete: false,
// 		},
// 	)
// 	scrollToBottom()
// 	const chats = getChats(+uuid, 20)
// 	const userContext = transform(chats)
//
// 	try {
// 		const eventSource = fetchChatAPIProcess<Chat.ConversationResponse>({
// 			system: systemRef.value.value,
// 			usingContext: usingContext.value,
// 			userContext,
// 			prompt: message,
// 			options,
// 			signal: controller.signal,
// 		})
//
//
// 		eventSource.onmessage = function(event) {
// 			const data = JSON.parse(event.data)
// 			updateChat(
// 				+uuid,
// 				dataSources.value.length - 1,
// 				{
// 					dateTime: new Date().toLocaleString(),
// 					text: data.text ?? '',
// 					inversion: false,
// 					error: false,
// 					loading: false,
// 					conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
// 					requestOptions: { prompt: message, options: { ...options } },
// 					user: false,
// 					delete: false,
// 				},
// 			)
// 			scrollToBottomIfAtBottom()
// 		}
//
// 		eventSource.onerror = function(error) {
// 			//console.error('EventSource failed:', error)
// 			eventSource.close()
// 			loading.value = false
// 		}
//
// 		controller.signal.addEventListener('abort', () => {
// 			eventSource.close()
// 		})
//
// 	} catch (error) {
// 		const errorMessage = error?.message ?? t('common.wrong')
// 		console.error('try failed:', error)
// 		if (error.message === 'canceled') {
// 			updateChatSome(
// 				+uuid,
// 				dataSources.value.length - 1,
// 				{
// 					loading: false,
// 				},
// 			)
// 			scrollToBottomIfAtBottom()
// 			return
// 		}
//
// 		const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)
//
// 		if (currentChat?.text && currentChat.text !== '') {
// 			updateChatSome(
// 				+uuid,
// 				dataSources.value.length - 1,
// 				{
// 					text: `${currentChat.text}\n[${errorMessage}]`,
// 					error: false,
// 					loading: false,
// 				},
// 			)
// 			return
// 		}
//
// 		updateChat(
// 			+uuid,
// 			dataSources.value.length - 1,
// 			{
// 				dateTime: new Date().toLocaleString(),
// 				text: errorMessage,
// 				inversion: false,
// 				error: true,
// 				loading: false,
// 				conversationOptions: null,
// 				requestOptions: { prompt: message, options: { ...options } },
// 				user: false,
// 				delete: false,
// 			},
// 		)
// 		scrollToBottomIfAtBottom()
// 	} finally {
// 		//loading.value = false
// 	}
// }
//
//

async function onConversation() {
  const message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  const chatId = uuidv4()
  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
      user: true,
      delete: false,
      msgId: chatId.toString(),
      like: 0,
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
      user: true,
      delete: false,
      msgId: '',
      like: 0,
    },
  )
  scrollToBottom()
  const chats = getChats(+uuid, 20)
  const userContext = transform(chats)
  try {
    const lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        msgId: chatId.toString(),
        system: systemRef.value.value,
        usingContext: usingContext.value,
        userContext,
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          // console.log(`接收到数据块: ${xhr.responseText}`);
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(
              +uuid,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + data.text ?? '',
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
                user: false,
                delete: false,
                msgId: data.msgId,
                like: 0,
              },
            )
            // lastText = lastText + data.text
            // if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
            //   options.parentMessageId = data.id
            //   lastText = data.text
            //   message = ''
            //   return fetchChatAPIOnce()
            // }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            const errorMessage2 = t('common.wrong')
            console.log(errorMessage2)
          }
        },
      })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      +uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
        user: false,
        delete: false,
        msgId: '',
        like: 0,
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    +uuid,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, ...options },
      user: true,
      delete: false,
    },
  )

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        system: systemRef.value.value,
        usingContext: usingContext.value,
        userContext: undefined,
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(
              +uuid,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + data.text ?? '',
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, ...options },
                user: false,
                delete: false,
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      +uuid,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, ...options },
        user: false,
        delete: false,
      },
    )
  }
  finally {
    loading.value = false
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}
function handleModify(index: number) {
  if (loading.value)
    return
  prompt.value = chatStore.getChatByUuidAndIndex(+uuid, index)!.text
  chatStore.modifyChatByUuid(+uuid, index)
  chatStore.modifyChatByUuid(+uuid, index + 1)
}
function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(+uuid)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}
function DefaultSumbmit(type: number) {
  if (type == 1)
    prompt.value = t('chat.defaultDescQA1')

  else if (type == 2)
    prompt.value = t('chat.defaultDescQA2')

  else if (type == 3)
    prompt.value = t('chat.defaultDescQA3')

  else if (type == 4)
    prompt.value = t('chat.defaultDescQA4')

  else if (type == 5)
    prompt.value = t('chat.defaultDescQA5')

  else if (type == 6)
    prompt.value = t('chat.defaultDescQA6')

  else if (type == 7)
    prompt.value = t('chat.defaultDescQA7')

  else if (type == 8)
    prompt.value = t('chat.defaultDescQA8')

  handleSubmit()
}
function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

function handleSystemClose() {
  const system = { key: '', value: '' }
  chatStore.updateHistory(+uuid, { system })
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4', 'bg-gray-800']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden', 'bg-gray-800']
  return classes
})

onMounted(() => {
  scrollToBottom()
  if (inputRef.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

function onlike(index: number) {
  const currentChat = getChatByUuidAndIndex(+uuid, index)
  if (currentChat!.like != 2)
    currentChat!.like = 2

  else
    currentChat!.like = 0

  updateChat(
    +uuid,
    index,
    currentChat,
  )

  post({

    url: 'https://datapeanut.com/updateAnswerInfo/',
    data: { msgId: currentChat!.msgId, like: currentChat!.like },
  })
}
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
    />
    <main class="flex-1 overflow-hidden">
      <div
        id="scrollRef"
        ref="scrollRef"
        class="h-full overflow-hidden overflow-y-auto bg-gray-800"
      >
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl m-auto dark:bg-gray-800"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <div style="opacity: 0.7;">
                <div class="titlebg">
                  <div style="font-size: 60px;">
                    PeanutAI
                  </div>
                </div>
                <div>
                  {{ t('chat.titleDes') }}
                </div>
								<div>
									{{ t('chat.websiteDesc') }}
								</div>
              </div>
            </div>
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300" style="padding-left:10px;margin-left:10px;">
              <n-flex>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;margin-top:5px" @click="DefaultSumbmit(1)">
                  {{ t('chat.defaultQA1') }}
                </NButton>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;margin-top:5px" @click="DefaultSumbmit(2)">
                  {{ t('chat.defaultQA2') }}
                </NButton>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;margin-top:5px" @click="DefaultSumbmit(3)">
                  {{ t('chat.defaultQA3') }}
                </NButton>
              </n-flex>
            </div>
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300" style="padding-left:10px">
              <n-flex>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;margin-top:5px" @click="DefaultSumbmit(4)">
                  {{ t('chat.defaultQA4') }}
                </NButton>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;margin-top:5px" @click="DefaultSumbmit(5)">
                  {{ t('chat.defaultQA5') }}
                </NButton>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;margin-top:5px" @click="DefaultSumbmit(6)">
                  {{ t('chat.defaultQA6') }}
                </NButton>
              </n-flex>
            </div>
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300" style="padding-left:10px">
              <n-flex>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;" @click="DefaultSumbmit(7)">
                  {{ t('chat.defaultQA7') }}
                </NButton>
                <NButton strong secondary round color="#93DB70" type="success" style="margin-left:5px;" @click="DefaultSumbmit(8)">
                  {{ t('chat.defaultQA8') }}
                </NButton>
              </n-flex>
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                :delete-flag="item.delete"
                :like="item.like"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
                @modify="handleModify(index)"
                @onlike="onlike(index)"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  Stop 停止回答
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <HoverButton @click="handleClear">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:delete-bin-line" />
            </span>
          </HoverButton>
          <HoverButton v-if="!isMobile" @click="handleExport">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:download-2-line" />
            </span>
          </HoverButton>

          <HoverButton v-if="!isMobile" :tooltip="!usingContext ? t('chat.switchDes1') : t('chat.switchDes2') " @click="toggleUsingContext">
            <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
              <SvgIcon icon="ri:chat-history-line" />
            </span>
          </HoverButton>
          <NTag v-if="systemRef.key && usingContext" type="success" closable @close="handleSystemClose">
            {{ systemRef.key }}
          </NTag>

          <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.titlebg {
	border: none;
	height: 100px;
	width: 400px;
	opacity: 0.5;
	background-image: linear-gradient(45deg, rgb(27, 31, 78) 0%, #5c3649 100%);
	margin: 0 auto;
}
</style>

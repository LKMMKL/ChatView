<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NDropdown } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'

interface Props {
  msgId?: string
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  deleteFlag?: boolean
  like?: number
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
  (ev: 'modify'): void
  (ev: 'onlike'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { iconRender } = useIconRender()

const textRef = ref<HTMLElement>()

const asRawText = ref(props.inversion)

const like = ref(props.like)

const messageRef = ref<HTMLElement>()

const options = computed(() => {
  const common = [
    {
      label: t('chat.copy'),
      key: 'copyText',
      icon: iconRender({ icon: 'ri:file-copy-2-line' }),
    },
    {
      label: t('common.delete'),
      key: 'delete',
      icon: iconRender({ icon: 'ri:delete-bin-line' }),
    },
  ]

  if (!props.inversion) {
    common.unshift({
      label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
      key: 'toggleRenderType',
      icon: iconRender({ icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code' }),
    })
  }
  if (props.inversion) {
    common.unshift({
      label: t('chat.modify'),
      key: 'modifyText',
      icon: iconRender({ icon: 'ri:file-copy-2-line' }),
    })
  }

  return common
})

function handleSelect(key: 'modifyText' | 'copyText' | 'delete' | 'toggleRenderType') {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      return
    case 'toggleRenderType':
      asRawText.value = !asRawText.value
      return
    case 'delete':
      emit('delete')
      return
    case 'modifyText':
      emit('modify')
  }
}

function onClick() {
  if (like.value != 2)
    like.value = 2

  else
    like.value = 0

  emit('onlike')
}
function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden bg-gray-800"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </p>
      <div
        class="flex items-end gap-1 mt-2"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :delete-flag="deleteFlag"
          :as-raw-text="asRawText"
        />
        <button v-if="!inversion" style="height: 20px;width:20px" @click="onClick">
          <svg v-if="like != 2" style="height: 20px;width:20px" t="1722864247178" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2298" width="200" height="200"><path d="M873.251136 443.471231c0 0 30.612205 8.068769 31.612998 74.242911 0.73678 54.472636-28.877701 103.032608-71.226205 110.630656-65.666582 11.752672-102.437044-4.368494-80.648808 33.243125 31.912827 55.086619 58.367339 77.050864 56.735166 148.154271-13.068643 155.103544-133.382846 148.647505-174.923962 148.647505-41.543162-4.878101 6.348592-83.524299-156.419516-196.995653-58.366316-40.700981-105.102756-149.172461-156.995637-172.189687-51.876508-22.965038-147.015332-49.367361-188.558493-59.875692-41.48995-10.577916 9.29776-409.096329 50.806129-398.553205l0-0.193405c41.507346 7.684006 222.187405-19.561521 286.73142-31.595602 75.453483-14.016225 233.537917-64.366983 300.396651-12.332886 32.578999 25.384134 38.753629 72.542176 38.753629 72.542176s42.209334 26.840298 52.244898 71.489194c9.92914 44.243667-1.983167 61.138452-1.983167 61.138452s40.946574 9.420557 45.436842 76.454276C909.40659 431.365518 873.251136 443.471231 873.251136 443.471231z" fill="#bfbfbf" p-id="2299" /></svg>
          <svg v-else style="height: 20px;width:20px" t="1722864247178" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2298" width="200" height="200"><path d="M873.251136 443.471231c0 0 30.612205 8.068769 31.612998 74.242911 0.73678 54.472636-28.877701 103.032608-71.226205 110.630656-65.666582 11.752672-102.437044-4.368494-80.648808 33.243125 31.912827 55.086619 58.367339 77.050864 56.735166 148.154271-13.068643 155.103544-133.382846 148.647505-174.923962 148.647505-41.543162-4.878101 6.348592-83.524299-156.419516-196.995653-58.366316-40.700981-105.102756-149.172461-156.995637-172.189687-51.876508-22.965038-147.015332-49.367361-188.558493-59.875692-41.48995-10.577916 9.29776-409.096329 50.806129-398.553205l0-0.193405c41.507346 7.684006 222.187405-19.561521 286.73142-31.595602 75.453483-14.016225 233.537917-64.366983 300.396651-12.332886 32.578999 25.384134 38.753629 72.542176 38.753629 72.542176s42.209334 26.840298 52.244898 71.489194c9.92914 44.243667-1.983167 61.138452-1.983167 61.138452s40.946574 9.420557 45.436842 76.454276C909.40659 431.365518 873.251136 443.471231 873.251136 443.471231z" fill="#d4237a" p-id="2299" /></svg>
        </button>
        <div class="flex flex-col">
          <!--          <button -->
          <!--            v-if="inversion" -->
          <!--            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300" -->
          <!--            @click="handleRegenerate" -->
          <!--          > -->
          <!--            <SvgIcon icon="ri:restart-line" /> -->
          <!--          </button> -->
          <NDropdown :placement="!inversion ? 'right' : 'left'" :options="options" @select="handleSelect">
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

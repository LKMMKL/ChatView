<script setup lang='ts'>
import type { DataTableColumns } from 'naive-ui'
import { computed, h, ref, watch } from 'vue'
import { NButton, NCard, NDivider, NInput, NLayoutContent, NList, NListItem, NModal, NPopconfirm, NSpace, NTabPane, NTabs, NThing, useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import PromptRecommend from '../../../assets/recommend.json'
import { SvgIcon } from '..'
import { useChatStore, usePromptStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { useUsingContext } from '@/views/chat/hooks/useUsingContext'
import { useAppStoreWithOut } from '@/store/modules/app'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const appStore = useAppStoreWithOut()
interface DataProps {
  renderKey: string
  renderValue: string
  key: string
  value: string
}

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}
const route = useRoute()

const chatStore = useChatStore()
const message = useMessage()
const { usingContext } = useUsingContext()
const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const showModal = ref(false)

const importLoading = ref(false)
const exportLoading = ref(false)

const searchValue = ref<string>('')

// 移动端自适应相关
const { isMobile } = useBasicLayout()

const promptStore = usePromptStore()

// Prompt在线导入推荐List,根据部署者喜好进行修改(assets/recommend.json)
const promptRecommendList = PromptRecommend
const promptList = ref<any>(promptStore.promptList)

// 用于添加修改的临时prompt参数
const tempPromptKey = ref('')
const tempPromptValue = ref('')

// Modal模式，根据不同模式渲染不同的Modal内容
const modalMode = ref('')

// 这个是为了后期的修改Prompt内容考虑，因为要针对无uuid的list进行修改，且考虑到不能出现标题和内容的冲突，所以就需要一个临时item来记录一下
const tempModifiedItem = ref<any>({})

// 自定义prompt
const addDefaultPrompt = () => {
  const list = promptStore.getPromptList().promptList
  const ids = list.map(item => (item as { id: number }).id)

  switch (appStore.language) {
	    case 'zh-CN':
      if (!ids.includes(1))
        promptList.value.push({ id: 1, key: '评论写手', value: '你是一个经验丰富的跨境电商产品评论写手，可以根据给出的产品${产品名}，和目标评分${评分}，写出100字左右的评论。注意评论内容不携带具体评分。', notShowDelete: true } as never)
      if (!ids.includes(2))
        promptList.value.push({ id: 2, key: '行业分析', value: '假如你是一个擅长费曼讲解法的行业分析专家，会用通俗的语言解释公司所在行业的基本术语、行业规模、生命周期、发展历史、盈利模式、供应商、用户群体、竞争格局和监管政策。要求输出按照markdown小标题来展示。我输入的公司名称：${company}', notShowDelete: true } as never)
      if (!ids.includes(3))
        promptList.value.push({ id: 3, key: '市场分析', value: '作为一位经验丰富的专业市场分析师，针对特定行业${industry}，请提供一份详细的市场分析报告。报告应涵盖以下方面：行业概述、市场规模（历史数据与未来预测）、主要竞争对手分析、目标消费者特征描述、市场增长驱动因素和挑战、以及基于最新趋势的战略建议。请注意，在撰写过程中保持语言风格商务且专业，深入洞察市场动态并提供具有前瞻性和可行性的见解。报告的格式应包括标题页、目录、正文和附录（如有必要），确保信息结构清晰，逻辑严密。', notShowDelete: true } as never)
      if (!ids.includes(4))
        promptList.value.push({ id: 4, key: '商品推广文案生成', value: '你是一名经验丰富的商品推荐文案创作者，请为一款${product}写一篇${style}风格的推广种草文案。包含该产品的${property}，文案中包含至少${num1}个不同表情符号，以此来吸引潜在消费者的购买欲望。', notShowDelete: true } as never)
      if (!ids.includes(5))
        promptList.value.push({ id: 5, key: '营销标题生成', value: '你是一名专业的${platform}爆款标题专家。请你以${topic}为主题，以${keyword}为关键词，提供${num1}个吸引人眼球的标题。每个标题字数在${num2}个字以内，且标题中必须包含2个以上emoji表情符号，提升标题可读性。', notShowDelete: true } as never)
      if (!ids.includes(6))
        promptList.value.push({ id: 6, key: '高情商回复', value: '作为一个高情商的对话伙伴，对于用户提出的任何问题，你都能够提供既得体又关切的回答。现在，请针对以下问题展现你的高情商回应：“${question}”，并确保在回复中充分考虑到对方的情绪状态和潜在需求。', notShowDelete: true } as never)
      if (!ids.includes(7))
        promptList.value.push({ id: 7, key: '法律顾问', value: '作为一位拥有深厚跨领域法律专业知识和丰富实践经验的法律顾问，请针对用户提出的${theme}问题，提供详细、专业且易于理解的解答，并结合相关法律法规和实际案例进行解读，如果可能，请附上适用的法律条款或建议行动步骤。', notShowDelete: true } as never)

    default:
      if (!ids.includes(1))
        promptList.value.push({ id: 1, key: 'Comment writer', value: 'You are an experienced cross-border e-commerce product review writer who can write a review of about 100 words based on the given product and target rating. Please note that the comments do not include specific ratings.', notShowDelete: true } as never)
      if (!ids.includes(2))
        promptList.value.push({ id: 2, key: 'Industry Analysis', value: 'If you are an industry analysis expert skilled in Feynman\'s explanation method, you will explain the basic terminology, industry size, lifecycle, development history, profit model, suppliers, user groups, competitive landscape, and regulatory policies of the company\'s industry in plain language.', notShowDelete: true } as never)
      if (!ids.includes(3))
        promptList.value.push({ id: 3, key: 'market analysis', value: 'As an experienced professional market analyst, please provide a detailed market analysis report for a specific industry. The report should cover the following aspects: industry overview, market size (historical data and future forecasts), analysis of major competitors, description of target consumer characteristics, market growth drivers and challenges, and strategic recommendations based on the latest trends. Please note to maintain a business and professional language style during the writing process, provide in-depth insights into market dynamics, and offer forward-looking and feasible insights. The format of the report should include a title page, table of contents, main text, and appendices (if necessary) to ensure clear information structure and logical coherence.', notShowDelete: true } as never)
      if (!ids.includes(4))
        promptList.value.push({ id: 4, key: 'Product promotion copy generation', value: 'You are an experienced product recommendation copywriter. Please write a promotional copy with a designated style for a product. Include the specified features of the product and include at least one different emoji in the copy to attract potential consumers\' purchasing desire.', notShowDelete: true } as never)
      if (!ids.includes(5))
        promptList.value.push({ id: 5, key: 'Marketing Title Generation', value: 'You are a professional expert in popular headlines. Please provide ${num1} eye-catching titles with ${keyword} as the keyword, using the specified product as the theme. Each title must have a word count of no more than ${num2} and contain at least 2 emoji symbols to enhance its readability.', notShowDelete: true } as never)
      if (!ids.includes(6))
        promptList.value.push({ id: 6, key: 'High emotional intelligence response', value: 'As a high emotional intelligence conversational partner, you are able to provide both appropriate and caring answers to any questions raised by users. Now, please demonstrate your high emotional intelligence response to the following question: \'${question}\', and ensure that your response fully considers the other person\'s emotional state and potential needs.', notShowDelete: true } as never)
      if (!ids.includes(7))
        promptList.value.push({ id: 7, key: 'Legal Advisor', value: 'As a legal advisor with profound cross disciplinary legal expertise and rich practical experience, please provide detailed, professional, and easy to understand answers to the ${theme} questions raised by users, and interpret them in conjunction with relevant laws and regulations and practical cases. If possible, please attach applicable legal provisions or recommended action steps.', notShowDelete: true } as never)
  }
}
addDefaultPrompt()
// 添加修改导入都使用一个Modal, 临时修改内容占用tempPromptKey,切换状态前先将内容都清楚
const changeShowModal = (mode: 'use' | 'add' | 'modify' | 'local_import', selected = { key: '', value: '' }) => {
  if (mode === 'add') {
    tempPromptKey.value = ''
    tempPromptValue.value = ''
  }
  else if (mode === 'modify') {
    tempModifiedItem.value = { ...selected }
    tempPromptKey.value = selected.key
    tempPromptValue.value = selected.value
  }
  else if (mode === 'local_import') {
    tempPromptKey.value = 'local_import'
    tempPromptValue.value = ''
  }
  else if (mode === 'use') {
    const { uuid } = route.params as { uuid: string }
    const system = { key: selected.key, value: selected.value }
    chatStore.updateHistory(+uuid, { system })
    return
  }
  showModal.value = !showModal.value
  modalMode.value = mode
}

// 在线导入相关
const downloadURL = ref('')
const downloadDisabled = computed(() => downloadURL.value.trim().length < 1)
const setDownloadURL = (url: string) => {
  downloadURL.value = url
}

// 控制 input 按钮
const inputStatus = computed (() => tempPromptKey.value.trim().length < 1 || tempPromptValue.value.trim().length < 1)

// Prompt模板相关操作
const addPromptTemplate = () => {
  for (const i of promptList.value) {
    if (i.key === tempPromptKey.value) {
      message.error(t('store.addRepeatTitleTips'))
      return
    }
    if (i.value === tempPromptValue.value) {
      message.error(t('store.addRepeatContentTips', { msg: tempPromptKey.value }))
      return
    }
  }
  promptList.value.unshift({ key: tempPromptKey.value, value: tempPromptValue.value } as never)
  message.success(t('common.addSuccess'))
  changeShowModal('add')
}

const modifyPromptTemplate = () => {
  let index = 0

  // 通过临时索引把待修改项摘出来
  for (const i of promptList.value) {
    if (i.key === tempModifiedItem.value.key && i.value === tempModifiedItem.value.value)
      break
    index = index + 1
  }

  const tempList = promptList.value.filter((_: any, i: number) => i !== index)

  // 搜索有冲突的部分
  for (const i of tempList) {
    if (i.key === tempPromptKey.value) {
      message.error(t('store.editRepeatTitleTips'))
      return
    }
    if (i.value === tempPromptValue.value) {
      message.error(t('store.editRepeatContentTips', { msg: i.key }))
      return
    }
  }

  promptList.value = [{ key: tempPromptKey.value, value: tempPromptValue.value }, ...tempList] as never
  message.success(t('common.editSuccess'))
  changeShowModal('modify')
}

const deletePromptTemplate = (row: { key: string; value: string }) => {
  promptList.value = [
    ...promptList.value.filter((item: { key: string; value: string }) => item.key !== row.key),
  ] as never
  message.success(t('common.deleteSuccess'))
}

const clearPromptTemplate = () => {
  promptList.value = []
  message.success(t('common.clearSuccess'))
}

const importPromptTemplate = () => {
  try {
    const jsonData = JSON.parse(tempPromptValue.value)
    let key = ''
    let value = ''
    // 可以扩展加入更多模板字典的key
    if ('key' in jsonData[0]) {
      key = 'key'
      value = 'value'
    }
    else if ('act' in jsonData[0]) {
      key = 'act'
      value = 'prompt'
    }
    else {
      // 不支持的字典的key防止导入 以免破坏prompt商店打开
      message.warning('prompt key not supported.')
      throw new Error('prompt key not supported.')
    }

    for (const i of jsonData) {
      if (!('key' in i) || !('value' in i))
        throw new Error(t('store.importError'))
      let safe = true
      for (const j of promptList.value) {
        if (j.key === i[key]) {
          message.warning(t('store.importRepeatTitle', { msg: i[key] }))
          safe = false
          break
        }
        if (j.value === i[value]) {
          message.warning(t('store.importRepeatContent', { msg: i[key] }))
          safe = false
          break
        }
      }
      if (safe)
        promptList.value.unshift({ key: i[key], value: i[value] } as never)
    }
    message.success(t('common.importSuccess'))
  }
  catch {
    message.error('JSON 格式错误，请检查 JSON 格式')
  }
}

// 模板导出
const exportPromptTemplate = () => {
  exportLoading.value = true
  const jsonDataStr = JSON.stringify(promptList.value)
  const blob = new Blob([jsonDataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ChatGPTPromptTemplate.json'
  link.click()
  URL.revokeObjectURL(url)
  exportLoading.value = false
}

// 模板在线导入
const downloadPromptTemplate = async () => {
  try {
    importLoading.value = true
    const response = await fetch(downloadURL.value)
    const jsonData = await response.json()
    if ('key' in jsonData[0] && 'value' in jsonData[0])
      tempPromptValue.value = JSON.stringify(jsonData)
    if ('act' in jsonData[0] && 'prompt' in jsonData[0]) {
      const newJsonData = jsonData.map((item: { act: string; prompt: string }) => {
        return {
          key: item.act,
          value: item.prompt,
        }
      })
      tempPromptValue.value = JSON.stringify(newJsonData)
    }
    importPromptTemplate()
    downloadURL.value = ''
  }
  catch {
    message.error(t('store.downloadError'))
    downloadURL.value = ''
  }
  finally {
    importLoading.value = false
  }
}

// 移动端自适应相关
const renderTemplate = () => {
  const [keyLimit, valueLimit] = isMobile.value ? [10, 30] : [15, 50]

  return promptList.value.map((item: { key: string; value: string; notShowDelete: boolean }) => {
    return {
      renderKey: item.key.length <= keyLimit ? item.key : `${item.key.substring(0, keyLimit)}...`,
      renderValue: item.value.length <= valueLimit ? item.value : `${item.value.substring(0, valueLimit)}...`,
      key: item.key,
      value: item.value,
      notShowDelete: item.notShowDelete,
    }
  })
}

const pagination = computed(() => {
  const [pageSize, pageSlot] = isMobile.value ? [6, 5] : [7, 15]
  return {
    pageSize, pageSlot,
  }
})

// table相关
const createColumns = (): DataTableColumns<DataProps> => {
  return [
    {
      title: t('store.title'),
      key: 'renderKey',
    },
    {
      title: t('store.description'),
      key: 'renderValue',
    },
    {
      title: t('common.action'),
      key: 'actions',
      width: 100,
      align: 'center',
      render(row) {
        return h('div', { class: 'flex items-center flex-col gap-2' }, {
          default: () => [h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'primary',
              onClick: () => changeShowModal('use', row),
            },
            { default: () => t('common.use') },
          ),
          h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'info',
              onClick: () => changeShowModal('modify', row),
            },
            { default: () => t('common.edit') },
          ),
          h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'error',
              onClick: () => deletePromptTemplate(row),
            },
            { default: () => t('common.delete') },
          ),
          ],
        })
      },
    },
  ]
}

const columns = createColumns()

watch(
  () => promptList,
  () => {
    promptStore.updatePromptList(promptList.value)
  },
  { deep: true },
)

const dataSource = computed(() => {
  const data = renderTemplate()
  const value = searchValue.value
  if (value && value !== '') {
    return data.filter((item: DataProps) => {
      return item.renderKey.includes(value) || item.renderValue.includes(value)
    })
  }
  return data
})
</script>

<template>
  <NModal v-model:show="show" style="width: 90%; max-width: 900px;" preset="card">
    <div class="space-y-4">
      <NTabs type="segment">
        <NTabPane name="local" :tab="$t('store.local')">
          <div
            class="flex gap-3 mb-4"
            :class="[isMobile ? 'flex-col' : 'flex-row justify-between']"
          >
            <div class="flex items-center space-x-4">
              <NButton
                type="primary"
                size="small"
                @click="changeShowModal('add')"
              >
                {{ $t('common.add') }}
              </NButton>
              <NButton
                size="small"
                @click="changeShowModal('local_import')"
              >
                {{ $t('common.import') }}
              </NButton>
              <NButton
                size="small"
                :loading="exportLoading"
                @click="exportPromptTemplate()"
              >
                {{ $t('common.export') }}
              </NButton>
              <NPopconfirm @positive-click="clearPromptTemplate">
                <template #trigger>
                  <NButton size="small">
                    {{ $t('common.clear') }}
                  </NButton>
                </template>
                {{ $t('store.clearStoreConfirm') }}
              </NPopconfirm>
            </div>
            <div class="flex items-center">
              <NInput v-model:value="searchValue" style="width: 100%" />
            </div>
          </div>
          <!-- <NDataTable
            v-if="!isMobile"
            :max-height="400"
            :columns="columns"
            :data="dataSource"
            :pagination="pagination"
            :bordered="false"
          /> -->
          <NList style="max-height: 400px; overflow-y: auto;">
            <NListItem v-for="(item, index) of dataSource" :key="index">
              <NThing :title="item.renderKey" :description="item.renderValue" />
              <template #suffix>
                <div class="flex flex-col items-center gap-2">
                  <NButton tertiary size="small" type="info" :disabled="usingContext" @click="changeShowModal('use', item)">
                    {{ t('common.use') }}
                  </NButton>
                  <NButton v-if="item.notShowDelete ? false : true" tertiary size="small" type="info" @click="changeShowModal('modify', item)">
                    {{ t('common.edit') }}
                  </NButton>
                  <NButton v-if="item.notShowDelete ? false : true" tertiary size="small" type="error" @click="deletePromptTemplate(item)">
                    {{ t('common.delete') }}
                  </NButton>
                </div>
              </template>
            </NListItem>
          </NList>
        </NTabPane>
        <NTabPane name="download" :tab="$t('store.online')">
          <p class="mb-4">
            {{ $t('store.onlineImportWarning') }}
          </p>
          <div class="flex items-center gap-4">
            <NInput v-model:value="downloadURL" placeholder="" />
            <NButton
              strong
              secondary
              :disabled="downloadDisabled"
              :loading="importLoading"
              @click="downloadPromptTemplate()"
            >
              {{ $t('common.download') }}
            </NButton>
          </div>
          <NDivider />
          <NLayoutContent
            style="height: 360px"
            content-style="background: none;"
            :native-scrollbar="false"
          >
            <NCard
              v-for="info in promptRecommendList"
              :key="info.key" :title="info.key"
              style="margin: 5px;"
              embedded
              :bordered="true"
            >
              <p
                class="overflow-hidden text-ellipsis whitespace-nowrap"
                :title="info.desc"
              >
                {{ info.desc }}
              </p>
              <template #footer>
                <div class="flex items-center justify-end space-x-4">
                  <NButton text>
                    <a
                      :href="info.url"
                      target="_blank"
                    >
                      <SvgIcon class="text-xl" icon="ri:link" />
                    </a>
                  </NButton>
                  <NButton text @click="setDownloadURL(info.downloadUrl) ">
                    <SvgIcon class="text-xl" icon="ri:add-fill" />
                  </NButton>
                </div>
              </template>
            </NCard>
          </NLayoutContent>
        </NTabPane>
      </NTabs>
    </div>
  </NModal>

  <NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
    <NSpace v-if="modalMode === 'add' || modalMode === 'modify'" vertical>
      {{ t('store.title') }}
      <NInput v-model:value="tempPromptKey" />
      {{ t('store.description') }}
      <NInput v-model:value="tempPromptValue" type="textarea" />
      <NButton
        block
        type="primary"
        :disabled="inputStatus"
        @click="() => { modalMode === 'add' ? addPromptTemplate() : modifyPromptTemplate() }"
      >
        {{ t('common.confirm') }}
      </NButton>
    </NSpace>
    <NSpace v-if="modalMode === 'local_import'" vertical>
      <NInput
        v-model:value="tempPromptValue"
        :placeholder="t('store.importPlaceholder')"
        :autosize="{ minRows: 3, maxRows: 15 }"
        type="textarea"
      />
      <NButton
        block
        type="primary"
        :disabled="inputStatus"
        @click="() => { importPromptTemplate() }"
      >
        {{ t('common.import') }}
      </NButton>
    </NSpace>
  </NModal>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { NModal, NProgress, NUpload, useMessage, NSpin, NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
const message = useMessage()
const show = defineModel('visible', { type: Boolean, default: false })
const fileList = ref([])
const uploadProgress = ref(0)
const uploading = ref(false)
const controller = ref(null)
const responseText = ref('')
const showMarkdown = ref(false)
const analyzing = ref(false)

// 最大文件大小 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024

async function handleUpload1({ file }) {
  if (uploading.value)
    return

  // 检查文件大小
  if (file.file.size > MAX_FILE_SIZE) {
    message.error(t('chat.mediaUpload.fileTooLarge', { size: '100MB' }))
    fileList.value = []
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  // 创建新的 AbortController
  controller.value = new AbortController()

  // 获取文件扩展名
  const extension = file.file.name.split('.').pop()
  // 使用时间戳创建新文件名
  const timestamp = Date.now()
  const newFileName = `${timestamp}.${extension}`

  const formData = new FormData()
  formData.append('file', file.file)
  formData.append('file_name', newFileName) // 使用新的文件名
  formData.append('original_name', file.file.name) // 保存原始文件名

  try {
    const response = await axios.post('https://peanutai.datapeanut.com/upload_video/',
      formData,
      {
        signal: controller.value.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
        },
      },
    )

    if (response.data.success) {
      analyzing.value = true
      message.success(t('chat.mediaUpload.uploadSuccess'))
      responseText.value = response.data.text || ''
      showMarkdown.value = true
    }
    else {
      message.error(response.data.message || t('chat.mediaUpload.uploadFailed'))
    }
  }
  catch (error) {
    if (error.name === 'AbortError')
      message.info(t('chat.mediaUpload.uploadCanceled'))
    else
      message.error(`${t('chat.mediaUpload.uploadFailed')}: ${error.message}`)
  }
  finally {
    uploading.value = false
    analyzing.value = false
    controller.value = null
  }
}

// 新的模拟上传函数
async function handleUpload({ file }) {
  if (uploading.value)
    return

  // 检查文件大小
  if (file.file.size > MAX_FILE_SIZE) {
    message.error(t('chat.mediaUpload.fileTooLarge', { size: '100MB' }))
    fileList.value = []
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  // 模拟上传进度
  const interval = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 10
    } else {
      clearInterval(interval)
      // 模拟上传完成
      uploading.value = false
      analyzing.value = true // 开始分析
      message.success(t('chat.mediaUpload.uploadSuccess'))
      
      // 模拟分析延迟
      setTimeout(() => {
        // 模拟返回的分析文本
        responseText.value = `# 视频分析报告

## 基本信息
- 文件名：${file.file.name}
- 时长：3分钟27秒
- 分辨率：1920x1080
- 大小：${(file.file.size / 1024 / 1024).toFixed(2)}MB

## 内容分析
1. 主题：电商产品展示
2. 场景：室内产品拍摄
3. 主要内容：
   - 0:00-0:30 产品包装展示
   - 0:31-1:45 产品特性介绍
   - 1:46-3:27 使用演示

## 优化建议
1. 建议在开头添加品牌Logo
2. 可以增加字幕以提升可访问性
3. 建议添加背景音乐
4. 产品特写镜头可以放慢速度

## 市场建议
- 适合在以下平台投放：
  * Amazon
  * TikTok Shop
  * Instagram Shopping
- 建议添加多语言字幕以扩大受众
- 可以将视频剪辑成15秒短版本用于社交媒体

## 技术建议
1. 提升视频压缩比例
2. 优化色彩平衡
3. 建议使用H.264编码以提升兼容性`

        showMarkdown.value = true
        analyzing.value = false // 分析完成
      }, 2000) // 模拟2秒的分析时间
    }
  }, 300)

  // 保存 interval 以便在需要时清除
  controller.value = {
    abort: () => {
      clearInterval(interval)
      uploading.value = false
      uploadProgress.value = 0
      message.info(t('chat.mediaUpload.uploadCanceled'))
    }
  }
}

// 监听模态窗口关闭
watch(show, (newVal) => {
  if (!newVal) {
    if (controller.value) {
      controller.value.abort()
      uploading.value = false
    }
    uploadProgress.value = 0
    fileList.value = []
    responseText.value = ''
    showMarkdown.value = false
    analyzing.value = false
  }
})

// 下载分析结果
function downloadAnalysis() {
  const blob = new Blob([responseText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analysis_${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  message.success(t('chat.mediaUpload.downloadSuccess'))
}
</script>

<template>
  <NModal
    v-model:show="show"
    preset="card"
    style="width: 600px; background-color: rgba(32, 33, 35);color: #e5e7eb;"
    class="media-upload-modal"
    :mask-closable="false"
  >
    <template #header>
      <div style="color: rgb(75 158 95)">
        {{ t('chat.mediaUpload.title') }}
      </div>
    </template>
    <NSpin :show="analyzing" description="分析中...">
      <NUpload
        v-model:file-list="fileList"
        :max="1"
        accept=".mp3,.mp4,.wav,.avi"
        directory-dnd
        class="w-full"
        :disabled="uploading || analyzing"
        :max-size="MAX_FILE_SIZE"
        @change="handleUpload"
      >
        <div class="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary bg-gray-900">
          <div class="text-xl mb-2">
            <div i-carbon-cloud-upload class="text-2xl" />
          </div>
          <div class="mb-2 text-gray-300">
            {{ uploading ? t('chat.mediaUpload.uploading') : t('chat.mediaUpload.selectFile') }}
          </div>
          <div class="text-xs text-gray-500">
            {{ t('chat.mediaUpload.dragTips') }}
          </div>
          <div class="text-xs text-gray-500 mt-2">
            {{ t('chat.mediaUpload.sizeLimit', { size: '100MB' }) }}
          </div>
        </div>
      </NUpload>
      <div v-if="fileList.length > 0" class="mt-4 w-full">
        <div class="mb-2 text-gray-300">
          {{ fileList[0]?.name }}
        </div>
        <NProgress
          v-if="uploadProgress > 0"
          type="line"
          :percentage="uploadProgress"
          :show-indicator="true"
          :processing="uploading"
        />
      </div>
      <div v-if="showMarkdown && responseText" class="mt-4 w-full">
        <div class="flex justify-between items-center mb-2">
          <div class="text-sm text-gray-300 font-medium">
            {{ t('chat.mediaUpload.analysisResult') }}
          </div>
          <NButton
            size="small"
            type="primary"
            @click="downloadAnalysis"
          >
            {{ t('chat.mediaUpload.download') }}
          </NButton>
        </div>
        <div class="markdown-body bg-gray-900 p-4 rounded-lg text-gray-300 text-sm overflow-auto max-h-60">
          {{ responseText }}
        </div>
      </div>
    </NSpin>
  </NModal>
</template>

<style scoped>
.n-upload {
  width: 100%;
}

:deep(.n-upload-trigger) {
  width: 100%;
}

:deep(.media-upload-modal.n-modal) {
  background-color: #111827;
}

:deep(.media-upload-modal .n-modal-mask) {
  background-color: rgba(0, 0, 0, 0.75);
}

:deep(.media-upload-modal .n-card) {
  background-color: #111827;
  color: #e5e7eb;
  border: 1px solid #374151;
}

:deep(.media-upload-modal .n-card-header) {
  border-bottom: 1px solid #374151;
}

:deep(.media-upload-modal .n-upload) {
  background-color: transparent;
}

:deep(.media-upload-modal .n-upload-trigger) {
  background-color: transparent;
}

:deep(.media-upload-modal .n-upload-file-list) {
  color: #e5e7eb;
}

:deep(.media-upload-modal .n-upload-dragger) {
  background-color: #111827;
  border-color: #374151;
}

:deep(.media-upload-modal .n-upload-dragger:hover) {
  border-color: #60a5fa;
}

:deep(.media-upload-modal .n-progress) {
  color: #e5e7eb;
}

.markdown-body {
  line-height: 1.6;
  word-wrap: break-word;
  border: 1px solid #374151;
  color: #E5E7EB;
}

.markdown-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.markdown-body::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
  
}

.markdown-body::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>

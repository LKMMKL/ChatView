<script setup lang='ts'>
import { ref, watch } from 'vue'
import { NModal, NProgress, NUpload, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
const message = useMessage()
const show = defineModel('visible', { type: Boolean, default: false })
const fileList = ref([])
const uploadProgress = ref(0)
const uploading = ref(false)
const controller = ref(null)

// 最大文件大小 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024

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
      message.success(t('chat.mediaUpload.uploadSuccess'))
      show.value = false
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
    controller.value = null
  }
}

// 监听模态窗口关闭
watch(show, (newVal) => {
  if (!newVal && controller.value) {
    // 如果窗口关闭且正在上传，则取消上传
    controller.value.abort()
    uploading.value = false
    uploadProgress.value = 0
    fileList.value = []
  }
})
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
    <NUpload
      v-model:file-list="fileList"
      :max="1"
      accept=".mp3,.mp4,.wav,.avi"
      directory-dnd
      class="w-full"
      :disabled="uploading"
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
</style>

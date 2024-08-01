<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { fetchVerify } from '@/api'
import { useAuthStore } from '@/store'
import Icon403 from '@/icons/403.vue'
import wxlogin from 'vue-wxlogin'
interface Props {
  visible: boolean
}

defineProps<Props>()
const appid = "wxbf8093585ea905b1"
const redirect_uri = "https://peanutai.datapeanut.com"
const state = "1"
const href = ""
const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)
const token = ref('')

const disabled = computed(() => !token.value.trim() || loading.value)


</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px;min-width: 640px;height:500px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4" s>
        <p class="text-base text-center text-slate-500 dark:text-slate-500 gradient-text">
          {{ $t('common.unauthorizedTips') }}
        </p>
        <wxlogin
            v-if="appid && redirect_uri"
            :appid="appid"
            scope="snsapi_login"
            :redirect_uri="redirect_uri"
            :href="href"
            :state="state"
            :style="{ width: '200px', height: '50px', fontSize: '16px', 'margin-left':'130px' }"
          ></wxlogin>
      </div>
    </div>
  </NModal>
</template>

<style scoped>

.gradient-text {
  /* 创建一个从左到右的线性渐变，颜色从红色到蓝色 */
  background-image: linear-gradient(to right, rgb(255, 192, 218), rgb(228, 3, 3));
	color: transparent;
	-webkit-background-clip: text;
}
</style>
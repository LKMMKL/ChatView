<script setup lang='ts'>
import { computed, ref } from 'vue'
import wxlogin from 'vue-wxlogin'
import { NModal } from 'naive-ui'
import { useRouter } from 'vue-router'
import { post } from '@/utils/request'
import { useAuthStore } from '@/store'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const router = useRouter()
interface Props {
  visible: boolean
}
interface Emit {
  (e: 'update:visible', visible: boolean): void
}
const authStore = useAuthStore()
const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})
const appid = 'wxbf8093585ea905b1'
const redirect_uri = 'https://peanutai.datapeanut.com'
const state = '1'
const href = ''
const userInfo = ref({
  account: '',
  pwd: '',
})
const regist = ref(false)

const isValidEmail = ref(true)

const errmessage = ref('信息错误, 重新输入')

function validEmail() {
  const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  const pwdPattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/
  if (!emailPattern.test(userInfo.value.account)) {
    errmessage.value = '邮箱格式不对，请重新输入'
    return false
  }
  if (!pwdPattern.test(userInfo.value.pwd)) {
    errmessage.value = '密码格式不对，请重新输入'
    return false
  }
  errmessage.value = ''
  return true
}

function rgistryOrLogin() {
  if (validEmail()) {
    post<any>({ url: 'https://datapeanut.com/rgistryOrLogin/', data: { account: userInfo.value.account, pwd: userInfo.value.pwd } }).then((responese) => {
      if (responese.message == '登录成功') {
        authStore.setToken(responese.access_token)
        router.push('/')
        emit('update:visible', false)
      }
      else {
        errmessage.value = responese.message
      }
    })
  }
  else {
    isValidEmail.value = false
  }
}

function sendCode() {

}
</script>

<template>
  <NModal v-model:show="show" style="width: 90%; max-width: 640px;min-width: 640px;height:480px" preset="card">
    <div class="p-10 bg-white rounded dark:bg-slate-800" :style="{ 'margin-top': '-50px' }">
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
          :style="{ 'width': '200px', 'height': '50px', 'fontSize': '16px', 'margin-left': '100px' }"
        />
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

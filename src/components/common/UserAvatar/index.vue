<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NAvatar } from 'naive-ui'
import { useAuthStore, useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import { isString } from '@/utils/is'
import { Login } from '@/components/common'
import { t } from '@/locales'
const userStore = useUserStore()
const authStore = useAuthStore()
const userInfo = computed(() => userStore.userInfo)
const token = authStore.token == '' || authStore.token == undefined
const show = ref(false)
function showLoginPage() {
  console.log('showpage')
}
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0 login_btn" @click="show = true">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <NAvatar
          :style="{
            color: 'white',
            backgroundColor: 'black',
          }"
          size="large"
        >
          {{ token ? t('common.login') : 'AI' }}
        </NAvatar>
      </template>
      <template v-else>
        <NAvatar size="large" round :src="defaultAvatar" />
      </template>
    </div>
    <div v-if="false" class="flex-1 min-w-0 ml-2">
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        <!-- {{ userInfo.name ?? 'LKM' }} -->
        LKM
      </h2>
    </div>
  </div>
  <Login v-model:visible="show" />
</template>

<style>
  .login_btn {
    cursor: pointer;
  }
</style>>

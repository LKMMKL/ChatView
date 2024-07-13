<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NAvatar, useModal, useMessage, NButton } from 'naive-ui'
import { useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import { isString } from '@/utils/is'
import {Login} from '@/components/common'
import { useAuthStore } from '@/store'
const userStore = useUserStore()
const authStore = useAuthStore()
const userInfo = computed(() => userStore.userInfo)
const show = ref(false)
function showLoginPage(){
  console.log("showpage")
}
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0 login_btn" @click="show = true">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <n-avatar
        :style="{
          color: 'white',
          backgroundColor: 'black'
        }"
        size="large"
      >
    {{  authStore.token == "" ? '登录': 'AI'}} 
  </n-avatar>
      </template>
      <template v-else>
        <NAvatar size="large" round :src="defaultAvatar" />
      </template>
    </div>
    <div class="flex-1 min-w-0 ml-2" v-if="false">
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
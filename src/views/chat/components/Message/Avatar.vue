<script lang="ts" setup>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import defaultAvatar1 from './peanutai.png'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'
import defaultAvatar from '@/assets/avatar.jpg'

interface Props {
  image?: boolean
}
defineProps<Props>()

const userStore = useUserStore()

const avatar = computed(() => userStore.userInfo.avatar)
</script>

<template>
  <template v-if="image">
    <NAvatar v-if="isString(avatar) && avatar.length > 0" :src="avatar" :fallback-src="defaultAvatar" />
    <NAvatar v-else round :src="defaultAvatar" />
  </template>
  <span v-else class="text-[28px] dark:text-white">
    <img :src="defaultAvatar1" alt="system" width="32" height="32">
  </span>
</template>

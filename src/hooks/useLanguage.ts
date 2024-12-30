import { enUS, zhCN } from 'naive-ui'
import { computed } from 'vue'
import { useAppStore } from '@/store'
import { setLocale } from '@/locales'

export function useLanguage() {
  const appStore = useAppStore()

  // const local = navigator.language
  // console.log(local)
  // // let language = zhCN
  // if (local === 'zh-CN') {
  //   setLocale('zh-CN')
  //   document.title = '花生AI-跨境电商的垂类大模型[PeanutAI][官网]'
  //   // language = zhCN
  // }
  // else {
  //   setLocale('en-US')
  //   document.title = 'PeanutAI | Vertical Large Model of Business Globalization [peanut ai][花生AI]'
  //   // language = enUS
  // }
  // appStore.setLanguage(local)
  const language = computed(() => {
    switch (appStore.language) {
      case 'zh-CN':
        setLocale('zh-CN')
        return zhCN
      default:
        setLocale('en-US')
        return enUS
    }
  })

  return { language }
}

<script setup lang='ts'>
import { computed, h, ref, watch } from 'vue'
import wxlogin from 'vue-wxlogin'
import { NModal, NForm, NFormItem, NSplit, NSpace, NInput, NButton, NInputGroup} from 'naive-ui'
import { post } from '@/utils/request'
import { get } from 'http'
import { useAuthStore } from '@/store'
import { useRouter } from 'vue-router'

const router = useRouter()
interface Props {
  visible: boolean
}
interface Emit {
  (e: 'update:visible', visible: boolean): void
}
const emit = defineEmits<Emit>()
const props = defineProps<Props>()
const authStore = useAuthStore()
const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})
const appid = "wx1a38fb5923aa85fe"
const redirect_uri = "https://datapeanut.com/login/nsdfsgdsdvs/wechatlogin.html"
const state = "1"
const href = ""
const userInfo = ref({
    account: "",
    pwd: ""
})
const regist = ref(false)

const isValidEmail = ref(true)

const errmessage = ref("信息错误, 重新输入")

function validEmail(){
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const pwdPattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
    if(!emailPattern.test(userInfo.value.account)) {
        errmessage.value = "邮箱格式不对，请重新输入"
        return false
    }
    if(!pwdPattern.test(userInfo.value.pwd)) {
        errmessage.value = "密码格式不对，请重新输入"
        return false
    }
    errmessage.value = ""
    return true
}


function rgistryOrLogin(){
    if(validEmail()){
        post<any>({url:"https://datapeanut.com/rgistryOrLogin/",data:{account: userInfo.value.account, pwd: userInfo.value.pwd}}).then(responese =>{
            if(responese.message == "登录成功"){
                authStore.setToken(responese['access_token'])
                router.push("/")
                emit('update:visible', false)
            }else{
                errmessage.value = responese.message
            }

        })
    }else{
        isValidEmail.value = false
    }
}

function sendCode(){

}
</script>

<template>
    <NModal v-model:show="show" style="width: 90%; max-width:650px;" preset="card">
        <n-split direction="horizontal" style="height: 380px" :resize-trigger-size="1" :max="0.9" :min="0.1" >
            <template #1>
                <div class="wxLogin">
                    <div class="main_wx">
                      <wxlogin
                        v-if="appid && redirect_uri"
                        :appid="appid"
                        scope="snsapi_login"
                        :redirect_uri="redirect_uri"
                        :href="href"
                        :state="state"
                        :style="{ width: '200px', height: '50px', fontSize: '16px' }"
                      ></wxlogin>
                    </div>
                  </div>
            </template>
            <template #2 >
                <div class="loginform">
                    <n-space vertical v-if="!regist">
                        <div class="txt">邮箱登录</div>
                        <n-input v-model:value="userInfo.account" round size="large" type="text" placeholder="邮箱" class="custom" />
                        <n-input v-model:value="userInfo.pwd" round  size="large"  type="password" placeholder="密码 需要8个数字和英文字母" class="custom"  />
                        <n-button strong secondary round size="large" type="success" :style="{width: '100%', 'margin-top': '20px'}" @click="rgistryOrLogin()">
                            登录 / 注册
                         </n-button>
                      </n-space>
                      <p v-if="!isValidEmail" style="color:red">{{errmessage}}</p>
                </div>
                
            </template>
        </n-split>
    </NModal>
</template>

<style scope="this api replaced by slot-scope in 2.5.0+">
.loginform {
    margin-left: 20px;
    text-align: center;
}
.custom {
    margin-top: 20px;
    height: 40px;
}
.txt {
    font-size: 20px;
}
.wechat-login-button {
    width: 100px; /* 设置按钮宽度 */
    height: 40px; /* 设置按钮高度 */
}
:v-deep .impowerBox{
    width: 100px; /* 设置按钮宽度 */
}
</style>
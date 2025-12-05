<template>
    <!-- 客服配置-在线客服 -->
    <div class="tabs-main online-service">
        <el-form ref="deployForm" :disabled="state.isDisabled" :model="state.formData" :label-width="$locale == 'zh' ? '200px' : 'auto'">
            <!-- <el-form-item :label="$t('跳过客服中心:')">
                <el-switch v-model="state.formData.csc" :active-value="1" :inactive-value="0" />
            </el-form-item> -->
            <el-form-item :label="$t('在线客服开关:')">
                <el-switch v-model="state.formData.ocs" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('客服地址:')" class="deploy-box">
                <div class="small-row">
                    <el-form-item label-width="0px">
                        <el-select disabled style="width: 145px;" model-value="1">
                            <el-option :label="$t('外部浏览器打开')" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label-width="0px">
                        <el-input v-model="state.formData.el" style="width: 600px;" :placeholder="$t('请输入客服链接')" />
                    </el-form-item>
                </div>
                <!-- <div class="small-row">
                    <el-select disabled style="width: 145px;" model-value="1">
                        <el-option :label="$t('APP内打开')" value="1" />
                    </el-select>
                    <el-form-item label-width="0px">
                        <el-input v-model="state.formData.il" style="width: 600px;" :placeholder="$t('请输入客服链接')" />
                    </el-form-item>
                </div>
                <div class="deploy-tips">{{$t('（APP支持内部打开或外部浏览器打开，网页仅支持外部浏览器打开）')}}</div> -->
            </el-form-item>
            <el-form-item :label="$t('客服头像：')">
                <UploadImage :disabled="state.isDisabled" v-model="state.formData.av" :width="128" :height="128"
                    :tip="$t('请上传128*128或等比例，PNG/JPG/GIF格式小于200KB的图片')" />
            </el-form-item>
            <div class="deploy-tips" style="color: red;padding-left: 200px;margin-bottom: 10px;">{{$t('说明：开关默认关闭状态，打开在线客服开关，将在首页显示客服入口。')}}</div>
            <!-- <el-form-item :label="$t('客服代码（仅对网页生效）:')">
                <el-input v-model="state.formData.code" style="width: 850px;" type="textarea" rows="20" :placeholder="$t('请输入客服名称')"
                    maxlength="2000" show-word-limit />
            </el-form-item> -->
            <el-form-item :label="$t('前端内容:')">
                <el-radio-group v-model="state.formData.ctt">
                    <el-radio :label="false" :value="false">{{$t('系统默认')}}</el-radio>
                    <el-radio :label="true" :value="true">{{$t('自定义')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('标题:')" v-if="!state.formData.ctt">
                <el-input v-model="state.formData.defTitle" disabled type="textarea" style="width: 600px;" :rows="1" :placeholder="$t('请输入标题')"
                    maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('说明:')" v-if="!state.formData.ctt">
                <el-input v-model="state.formData.defDesc" disabled type="textarea" style="width: 600px;" :rows="6" :placeholder="$t('请输入说明')"
                    maxlength="500" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('标题:')" v-if="state.formData.ctt">
                <el-input v-model="state.formData.tit" type="textarea" style="width: 600px;" :rows="1" :placeholder="$t('请输入标题')"
                    maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('说明:')" v-if="state.formData.ctt">
                <el-input v-model="state.formData.desc" type="textarea" style="width: 600px;" :rows="6" :placeholder="$t('请输入说明')"
                    maxlength="500" show-word-limit />
            </el-form-item>
        </el-form>
        <div class="foot" v-if="isPermiss">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import customer from '@/assets/img/common/customer.png'

const deployForm = ref(null)
const state = reactive({
    isDisabled: true,
    formData: {
        // csc: 0,
        ocs: 0,
        el: '',
        // il: '',
    },
})
const userData = userStore()

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.app.layout-cs')
})

onMounted(() => {
    isPermiss.value && getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'cs', type: 'cs' }).then(res => {
        let { data } = res
        if (data && Object.keys(data).length) {
            state.formData = Object.assign(state.formData, data)
            if (!state.formData.av) {
                state.formData.av = customer
            }
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 保存
const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let obj = { ...state.formData }
            if (obj.el && !!obj.el.indexOf('http')) obj.el = 'https://' + obj.el
            // if (obj.il && !!obj.il.indexOf('http')) obj.il = 'https://' + obj.il
            globalVBus.$emit('globalLoading', true)
            if (obj.av.indexOf('http') == -1) delete obj.av
            postHomeDeploy({
                part: 'cs',
                alias: 'cs',
                type: 'cs',
                status: 1,
                cs: JSON.stringify(obj)
            }).then(() => {
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善配置内容再进行提交！'))
        }
    })
}

</script>

<style lang="scss">
.tabs-main{
    overflow-y: auto;
}
.online-service {
    .deploy-box {
        .small-row {
            width: 100%;
            display: flex;
            margin-bottom: 20px;
        }
        .deploy-tips {
            width: 100%;
            margin-top: -10px;
            line-height: 36px;
            color: #666;
        }
    }
    .foot {
        margin-top: 50px;
        width: 650px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
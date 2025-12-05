<template>
    <!-- 品牌设置-Web页脚配置-总台技术支持 -->
    <div class="footer-advertising-config">
        <el-form ref="deployRef" :model="state.formData" :rules="state.rules" :disabled="state.isDisabled" label-width="150px">
            <el-form-item :label="$t('展示开关:')">
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('联系方式:')">
                <el-select disabled v-model="state.formData.type">
                    <el-option v-for="item in metaData.imType" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('链接地址')">
                <el-input disabled style="width: 300px" v-model="state.formData.account" />
            </el-form-item>
        </el-form>

        <div class="btn">
            <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.isDisabled" @click="handleSave">{{$t('保 存')}}</el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup name="footerAdvertisingConfig">
import { reactive, onMounted } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website.js'
import { getCountryAreaList } from '@/api/common.js'

const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {
        status: 1,
    },
    isDisabled: true,
    areaCountryList: []
})

getCountryAreaList().then(res => {
    state.areaCountryList = res.data || []
})

onMounted(() => {
    getData()
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'techSupport' }).then(({ data, code }) => {
        if (code === 0 && data) {
            state.formData = data
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleSave = () => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        part: 'techSupport',
        alias: 'techSupport',
        status: 1,
        techSupport: JSON.stringify(state.formData)
    }).then(() => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.footer-advertising-config {
    .btn {
        width: 800px;
        display: flex;
        justify-content: center;
        padding-top: 50px;
    }
}
</style>

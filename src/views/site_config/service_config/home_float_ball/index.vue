<template>
    <!-- 站点配置-客服配置-首页悬浮球配置 -->
    <div class="home-float-ball">
        <div class="head" v-if="isPermiss">
            <template v-if="state.dialogShow">
                <el-button v-throttle @click="cancel">{{ $t('取 消') }}</el-button>
                <el-button v-throttle type="primary" @click="handleSubmit">{{ $t('保 存') }}</el-button>
            </template>
            <el-button v-else v-throttle type="primary" @click="state.dialogShow = true">{{ $t('修 改') }}</el-button>
        </div>

        <el-form ref="formRef" :model="state.formData" label-width="180px" :disabled="!state.dialogShow">
            <el-form-item :label="$t('前端展示样式选择:')">
                <el-radio-group v-model="state.formData.showType">
                    <el-radio :label="1">{{ $t('悬浮球') }}</el-radio>
                    <el-radio :label="2">{{ $t('内容') }}</el-radio>
                    <el-radio :label="0">{{ $t('无') }}</el-radio>
                </el-radio-group>
            </el-form-item>

            <template v-if="state.formData.showType === 1">
                <el-form-item :label="$t('悬浮球图片配置:')"></el-form-item>
                <div class="flex">
                    <el-form-item :label="$t('未选择状态:')">
                        <UploadImage v-model="state.formData.unIcon" accept=".png,.jpg,.jpeg" :width="192" :height="192" />
                    </el-form-item>
                    <el-form-item :label="$t('已选择状态:')">
                        <UploadImage v-model="state.formData.icon" accept=".png,.jpg,.jpeg" :width="192" :height="192" />
                    </el-form-item>
                </div>
                <div class="tips padding-180">{{ $t("注：配置悬浮球为圆形，支持jpg，png格式，366*366规格，100kb以内") }}</div>
                <div class="tips padding-180">{{ $t("说明：系统检测该处配置后，前端显示配置，未配置则取app默认配置，如果app未配置，为系统默认logo配置。") }}</div>
            </template>

            <template v-if="[1, 2].includes(state.formData.showType)">
                <el-table class="table-box" :data="displaySubList" border>
                    <el-table-column :label="$t('类型')" min-width="150" align="center">
                        <template #default="{ row }">
                            <template v-if="row.type === 'tg_whatsapp'">
                                <el-radio-group v-model="state.formData.tgChoice" @change="handleTGChange">
                                    <el-radio label="tg">{{tgType_}}</el-radio>
                                    <el-radio label="whatsapp">{{waType_}}</el-radio>
                                </el-radio-group>
                            </template>
                            <template v-else>
                                <div>{{ row.type_ }}</div>
                            </template>
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('链接')" min-width="300" align="center">
                        <template #default="{ row }">
                            <template v-if="row.type === 'tg_whatsapp'">
                                <el-form-item label-width="0px">
                                    <el-input
                                        v-if="state.formData.tgChoice === 'tg'"
                                        v-model.trim="tgRow.link"
                                        style="width: 100%"
                                    />
                                    <el-input
                                        v-else
                                        v-model.trim="waRow.link"
                                        style="width: 100%"
                                    />
                                </el-form-item>
                            </template>
                            <template v-else>
                                <el-form-item label-width="0px">
                                    <el-input v-model.trim="row.link" style="width: 100%" />
                                </el-form-item>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>

                <el-form-item :label="$t('功能选择：')">
                    <el-radio-group v-model="state.formData.optionSelected">
                        <el-radio :label="0">{{ $t("无") }}</el-radio>
                        <el-radio :label="1">{{ $t("代理") }}</el-radio>
                        <el-radio :label="2">{{ $t("下载") }}</el-radio>
                        <el-radio :label="3">{{ $t("充值") }}</el-radio>
                    </el-radio-group>
                </el-form-item>
            </template>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { getCommonMeta } from '@/api/common'
import { deepClone } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    tableData: [],
    icon: '',
    unIcon: '',
    homeFloatBallType: [],
    dialogShow: false,
    formData: {
        showType: '',
        unIcon: '',
        icon: '',
        optionSelected: '',
        subList: [],
        tgChoice: 'tg' // 默认 telegram
    }
})

const userData = userStore()
const isPermiss = computed(() => userData.isHasPermiss('merchant.app.layout-cs'))

let tgRow = {}
let waRow = {}

const tgType_ = computed(() => {
    return state.formData.subList.find(item => item.type === 2)?.type_ || ''
})

const waType_ = computed(() => {
    return state.formData.subList.find(item => item.type === 6)?.type_ || ''
})

const displaySubList = computed(() => {
    const list = []
    state.formData.subList.forEach(item => {
        if (item.type === 2) tgRow = item
        else if (item.type === 6) waRow = item
        else list.push(item)
    })
    list.splice(2, 0, { type: 'tg_whatsapp', type_: 'TG / WhatsApp' })
    return list
})

onMounted(async () => {
    if (isPermiss.value) {
        let { data } = await getCommonMeta({ types: 'homeFloatBallType' })
        state.homeFloatBallType = data.homeFloatBallType.filter(item => item.value != 4 && item.value != 5) || []
        getData()
    }
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'homeFloatBall', type: 'cs' }).then(res => {
        const { subList = [], showType = '', optionSelected = '' } = res.data || {}
        let tableData = subList?.filter(item => item.type !== 5 && item.type !== 4) || []

        if (tableData.length) {
            state.homeFloatBallType.forEach((item) => {
                let exist = tableData.some(i => i.type === +item.value)
                if (!exist) {
                    tableData.push({ type: +item.value, type_: item.label, link: '' })
                }
            })
            tableData.forEach(item => {
                const match = state.homeFloatBallType.find(val => +val.value === item.type)
                if (match) item.type_ = match.label
            })
        } else {
            tableData = state.homeFloatBallType.map(item => ({
                type: +item.value,
                type_: item.label,
                link: ''
            }))
        }

        const tg = tableData.find(i => i.type === 2)
        const wa = tableData.find(i => i.type === 6)
        if (wa?.link) {
            state.formData.tgChoice = 'whatsapp'
        } else {
            state.formData.tgChoice = 'tg'
        }

        state.formData.subList = tableData
        state.formData.showType = showType
        state.formData.optionSelected = optionSelected
        state.formData.icon = subList.find(item => item.type === 5)?.link || ''
        state.formData.unIcon = subList.find(item => item.type === 4)?.link || ''
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.formData.subList = []
        globalVBus.$emit('globalLoading', false)
    })
}


const handleTGChange = (val) => {
    if (val === 'tg') {
        waRow.link = ''
        tgRow.link = 'https://'
    } else {
        tgRow.link = ''
        waRow.link = 'https://'
    }
}

const cancel = () => {
    state.dialogShow = false
    getData()
}

const handleSubmit = () => {
    let arr = deepClone(state.formData.subList)
    arr.push({ link: state.formData.unIcon, type: 4 })
    arr.push({ link: state.formData.icon, type: 5 })

    const config = {
        showType: state.formData.showType,
        optionSelected: state.formData.optionSelected
    }

    config.subList = arr.map(item => {
        if (item.link && item.link.indexOf('http') !== 0) {
            item.link = 'https://' + item.link
        }
        delete item.type_
        return item
    })

    const params = {
        part: 'homeFloatBall',
        alias: 'homeFloatBall',
        type: 'cs',
        status: 1,
        homeFloatBallConfig: JSON.stringify(config)
    }

    globalVBus.$emit('globalLoading', true)
    postHomeDeploy(params).then(() => {
        globalVBus.$emit('globalLoading', false)
        state.dialogShow = false
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.home-float-ball {
    .head {
        width: 700px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
    .tips {
        color: red;
        font-size: 14px;
    }
    .padding-180 {
        padding-left: 180px;
        box-sizing: border-box;
    }
    .table-box {
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 180px;
        width: 700px;
        .el-table__body-wrapper {
            max-height: 300px;
        }
    }
}
</style>

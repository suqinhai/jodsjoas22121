<template>
    <!-- 代理设置 -->
    <div class="tabs agent-setting">
        <el-tabs v-model="state.tabItem">
            <el-tab-pane :label="$t('代理等级')" name="1">
                <AgentLevel></AgentLevel>
            </el-tab-pane>
            <el-tab-pane :label="$t('结算设置')" name="2" v-if="userData.isHasPermiss('admin.meta.itemList-3')">
                <SettlementSet ref="settlementSetRef" :deployData="state.deployData" @getData="getData" @submit="handleSubmit">
                </SettlementSet>
            </el-tab-pane>
            <!-- <el-tab-pane :label="$t('推广设置')" name="3">
                <PopularizeSet></PopularizeSet>
            </el-tab-pane> -->
            <el-tab-pane :label="$t('敏感数据展示开关')" name="4">
                <DataShowSwitch ref="dataShowSwitchRef" :deployData="state.deployData" @submit="handleSubmit">
                </DataShowSwitch>
            </el-tab-pane>

            <el-tab-pane :label="$t('网站分享内容设置')" name="5" v-if="userData.isHasPermiss('merchant.agent.shareContent')">
                <ShareConfig ref="shareConfigRef" :deployData="state.deployData" @submit="handleSubmit" />
            </el-tab-pane>

            <el-tab-pane :label="$t('代理推广链接方式')" name="6" v-if="userData.isHasPermiss('merchant.agent.linkMethod')">
                <SeoSet />
            </el-tab-pane>

        </el-tabs>
    </div>
</template>

<script setup name='agentSetting'>
import { defineAsyncComponent, ref, reactive, onMounted } from "vue"
import userStore from '@/store/user'
import { getMetaData, postMetaData } from "@/api/common.js"
const AgentLevel = defineAsyncComponent(() => import("./agent_level/index.vue"))
const SettlementSet = defineAsyncComponent(() => import("./settlement_set/index.vue"))
// const PopularizeSet = defineAsyncComponent(() => import("./popularize_set/index.vue"))
const DataShowSwitch = defineAsyncComponent(() => import("./data_show_switch/index.vue"))
const ShareConfig = defineAsyncComponent(() => import("./share-config/index.vue"))
const SeoSet = defineAsyncComponent(() => import("./seo/index.vue"))

let settlementSetRef = ref(null)
let dataShowSwitchRef = ref(null)
const shareConfigRef = ref(null)

const userData = userStore()
let state = reactive({
    tabItem: '1',
    deployData: {},
    operateType: 0
})

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 3 }).then((res) => {
        state.deployData = {}
        if (res.data) {
            let arr = Object.values(res.data)
            if (arr[0] && arr[0].id) {
                state.deployData = arr[0]
            }
        }
        if (state.operateType === 1) {
            settlementSetRef.value.success()
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
        if (state.operateType === 2) {
            dataShowSwitchRef.value.fail()
        }
    })
}

const handleSubmit = (obj) => {
    state.operateType = obj.operateType
    delete obj.operateType
    let params = {
        config: JSON.stringify(obj),
        type: 3,
        name: 'agent_settle_config',
        label: $t('代理结算设置'),
        id: state.deployData.id || '',
    }
    globalVBus.$emit('globalLoading', true)
    postMetaData(params).then(() => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.agent-setting {
    // min-width: 1300px;
}
</style>

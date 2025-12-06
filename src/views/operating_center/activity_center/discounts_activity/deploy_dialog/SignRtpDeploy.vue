<template>
    <!-- 活动中心-活动配置弹窗-签到活动-RTP配置 -->
    <Dialog top="2vh" :title="title" width="700" @confirm="handleSubmit" :isShowBottomButton="!isDisabled" @cancel="emits('close')">
        <div class="rtpSetting">
            <div class="tips">{{$t('损益模式：控输（RTP＜100）')}}</div>
            <el-tabs v-model="activeTab">
                <el-tab-pane :label="$t('TTT厂家')" :name="1"></el-tab-pane>
                <el-tab-pane :label="$t('bbgt厂家')" :name="2"></el-tab-pane>
                <el-tab-pane :label="$t('/jili/pp厂家')" :name="3"></el-tab-pane>
            </el-tabs>
            <div class="settingBox">
                <el-table style="width: 500px" :data="list" border>
                    <el-table-column prop="rate" :label="$t('设置比例')" align="center">
                        <template #default="{ row }">
                            <el-input-number style="width: 100%" v-model="row.rate" :disabled="isDisabled" :controls="false" :precision="0" :min="0"
                                :max="100" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="pool" :label="$t('rtp池子')" align="center">
                        <template #default="{ row }">
                            <el-select style="width: 100%" v-model="row.pool" :disabled="isDisabled">
                                <el-option v-for="item in poolList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>

                </el-table>
                <div class="addBox" v-if="!isDisabled">
                    <el-button v-throttle v-if="list && list.length > 0" type="danger" @click="handleMinus(index)" :icon="Minus">
                    </el-button>
                    <el-button v-throttle type="primary" @click="handlePlus(index)" :icon="Plus"></el-button>
                </div>
            </div>
            <div class="endBox" style="margin-top:10px;">
                <label>{{$t('结束控制条件')}}</label>
                <el-radio-group v-model="state.cash" style="margin-left:10px;" :disabled="isDisabled">
                    <el-radio :label="1">{{$t('触发提现')}}</el-radio>
                    <el-radio :label="0">{{$t('余额低于')}}
                        <el-input-number style="display: inline-block;margin-left:10px;width: 150px" :controls="false" :precision="2" :min="0"
                            v-model="state.minBalance" v-if="state.cash === 0" :disabled="isDisabled" />
                    </el-radio>
                </el-radio-group>
            </div>
            <div class="tips">{{$t('注：各厂家设置比例总和需等于100')}}</div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus } from "@element-plus/icons-vue"
import { getCommonMeta } from '@/api/common'
import { add } from '@/common/util/index'

const emits = defineEmits(["close", "setRtpData"])
const props = defineProps(['itemData', 'isDisabled'])
const title = ref($t('领取优惠后使用rtp配置'))
const activeTab = ref(1)
const state = reactive({
    cash: 0,
    TTTList: [],
    bbgtList: [],
    commonList: [],
    ctrlPools: {
        bgtCtrlPools: [],
        TTTCtrlPools: [],
        commonList: []
    },
    params: {}
})

const list = computed(() => {
    let list = []
    if (activeTab.value === 1) {
        list = state.TTTList
    } else if (activeTab.value === 2) {
        list = state.bbgtList
    } else if (activeTab.value === 3) {
        list = state.commonList
    } else {
        list = []
    }
    return list
})
const poolList = computed(() => {
    if (activeTab.value === 1) {
        return state.ctrlPools.bgtCtrlPools || []
    } else if (activeTab.value === 2) {
        return state.ctrlPools.TTTCtrlPools || []
    } else if (activeTab.value === 3) {
        return state.ctrlPools.commonCtrlPools || []
    } else {
        return []
    }
})

onMounted(() => {
    getCommonMeta({ types: 'bgtCtrlPools,TTTCtrlPools,ctrlPools' }).then(res => {
        state.ctrlPools.bgtCtrlPools = res.data.bgtCtrlPools.filter((item) => { return parseInt(item.label) <= '100' })
        state.ctrlPools.TTTCtrlPools = res.data.TTTCtrlPools.filter((item) => { return parseInt(item.label) <= '100' })
        state.ctrlPools.commonCtrlPools = res.data.ctrlPools.filter((item) => { return parseInt(item.label) <= '100' })
    })
    handleInitData()
})

const handleInitData = () => {
    const { cash, minBalance = '', pools = { TTT: {}, BGT: {}, PGC: {} } } = props.itemData
    state.cash = cash ? 1 : 0
    state.minBalance = minBalance
    Object.entries(pools).forEach(item => {
        if (item[0] === 'TTT') {
            Object.entries(item[1]).forEach(v => {
                state.TTTList.push({
                    rate: v[1],
                    pool: v[0]
                })
            })
        }
        if (item[0] === 'BGT') {
            Object.entries(item[1]).forEach(v => {
                state.bbgtList.push({
                    rate: v[1],
                    pool: v[0]
                })
            })
        }
        if (item[0] === 'PGC') {
            Object.entries(item[1]).forEach(v => {
                state.commonList.push({
                    rate: v[1],
                    pool: v[0]
                })
            })
        }
    })
}

const handlePlus = () => {
    list.value.push({ rate: 0, pool: '' })
}
const handleMinus = () => {
    list.value.pop()
}


const handleTTTList = () => {
    state.params['TTT'] = {}
    let TTTSum = 0
    let TTTPool
    let goOn = true
    let effectList = state.TTTList.filter(item => !!item.rate && !!item.pool)
    effectList.forEach(item => {
        if (!goOn) return
        if (!TTTPool) {
            TTTPool = item.pool
        } else if (TTTPool && TTTPool === item.pool) {
            goOn = false
            return ElMessage.warning($t('rtp概率不能重复'))
        }
        TTTSum = add(TTTSum, item.rate)
        state.params['TTT'][item.pool] = item.rate
    })
    if (!goOn) return goOn
    if (TTTSum !== 100 && effectList.length) {
        ElMessage.warning($t('比例总和需等于100'))
        goOn = false
    }
    return goOn
}

const handlebbgtList = () => {
    state.params['BGT'] = {}
    let bbgtSum = 0
    let bbgtPool
    let goOn = true
    let effectList = state.bbgtList.filter(item => !!item.rate && !!item.pool)
    effectList.forEach(item => {
        if (!goOn) return
        if (!bbgtPool) {
            bbgtPool = item.pool
        } else if (bbgtPool && bbgtPool === item.pool) {
            goOn = false
            return ElMessage.warning($t('rtp概率不能重复'))
        }
        bbgtSum = add(bbgtSum, item.rate)
        state.params['BGT'][item.pool] = item.rate
    })
    if (!goOn) return goOn
    if (bbgtSum !== 100 && effectList.length) {
        ElMessage.warning($t('比例总和需等于100'))
        goOn = false
    }
    return goOn
}

const handleCommonList = () => {
    state.params['PGC'] = {}
    let commonSum = 0
    let commonPool
    let goOn = true
    let effectList = state.commonList.filter(item => !!item.rate && !!item.pool)
    effectList.forEach(item => {
        if (!goOn) return
        if (!commonPool) {
            commonPool = item.pool
        } else if (commonPool && commonPool === item.pool) {
            goOn = false
            return ElMessage.warning($t('rtp概率不能重复'))
        }
        commonSum = add(commonSum, item.rate)
        state.params['PGC'][item.pool] = item.rate
    })
    if (!goOn) return goOn
    if (commonSum !== 100 && effectList.length) {
        ElMessage.warning($t('比例总和需等于100'))
        goOn = false
    }
    return goOn
}

const handleSubmit = () => {
    if (!handleTTTList()) return
    if (!handlebbgtList()) return
    if (!handleCommonList()) return
    if (state.cash === 0 && !state.minBalance) return ElMessage.warning($t('请填写余额低于多少结束控制'))
    let params = {
        pools: {
            ...state.params
        },
        cash: !!state.cash
    }
    if (state.cash === 0) params.minBalance = state.minBalance
    emits('setRtpData', params)
    emits('close')
}
</script>

<style lang="scss">
.settingBox {
    display: flex;
    .addBox {
        margin-left: 15px;
        align-self: flex-end;
    }
}
</style>
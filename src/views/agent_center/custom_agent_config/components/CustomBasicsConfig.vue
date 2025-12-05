<template>
    <!-- 代理中心-定制版基础配置 -->
    <div class="three-agent-configuration">
        <el-form ref="addFrom" class="filter-form" :disabled="state.formDataDisabled">
            <el-form-item :label="$t('邀请返佣模式开关')">
                <el-checkbox v-model="state.formData.open">{{ $t('已开启') }}</el-checkbox>
            </el-form-item>
        </el-form>

        <div class="title">{{ $t('邀请人的合格条件') }}</div>
        <el-form ref="addFrom" class="filter-form" :disabled="state.formDataDisabled">
            <div style="margin-bottom: 10px;">{{ $t('注：开启后,被邀请人在注册30天内完成条件后,才能计为一个合格人数;如果注册30天没有完成条件,将无法成功领取奖励') }}</div>
            <!-- <div>{{ $t('注：每个受邀人完成合格条件后,邀请人可收到一笔单次奖励') }}</div> -->
            <el-form-item>
                <el-checkbox v-model="state.formData.bindPhone">{{ $t('已绑定手机号码') }}</el-checkbox>
                <el-checkbox v-model="state.formData.ipUnique">{{ $t('注册IP一个月内是唯一') }}</el-checkbox>
                <el-checkbox v-model="state.formData.bindCash">{{ $t('已绑定收款方式') }}</el-checkbox>
                <div></div>
               <div class="item-label" :class="{'item-disabled': state.formDataDisabled}">{{ $t('存款金额 ≥ ') }}
                    <el-input-number v-model="state.formData.recharge" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0"
                        :min="0" :max="10000000" />
                </div>
               <div class="item-label" :class="{'item-disabled': state.formDataDisabled}">{{ $t('有效流水') }}
                     <el-select style="width: 200px" v-model="state.formData.gameType"
                        :placeholder="$t('游戏类型')">
                        <el-option v-for="item in metaData.gameType" :key="item.value" :label="item.label" :value="+item.value" />
                    </el-select> ≥
                    <el-input-number v-model="state.formData.playCoin" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0"
                        :min="0" :max="100000000" />
                </div>
            </el-form-item>
        </el-form>

        <div class="title">{{ $t('邀请奖励') }}</div>
        <el-form ref="addFrom" class="filter-form" :disabled="state.formDataDisabled">
            <el-form-item :label="$t('一次性邀请奖励')">
                <el-checkbox v-model="state.formData.inviteConfig.open" style="margin-right: 10px;">{{ $t('已开启')
        }}</el-checkbox>
            </el-form-item>
            <div style="margin-bottom: 10px;">{{ $t('注：每个受邀人完成合格条件后,邀请人可收到一笔单次奖励') }}</div>
            <el-table class="table-box wd550" :data="state.formData.inviteConfig.rewards" border>
                <el-table-column :label="$t('邀请最低人数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.minNum" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="1"
                            :max="99999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('邀请最高人数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.maxNum" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="1"
                            :max="99999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.reward" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0.1"
                            :max="10000000" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('稽核倍数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.auditMultiple" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="0"
                            :max="9999999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励票券类型')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-select style="width: 200px" v-model="row.ticketType" :placeholder="$t('奖励票券类型')" @change="row.ticketId = ''">
                            <el-option v-for="item in metaData.ticketType" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励票券名称')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-select style="width: 200px" v-model="row.ticketId" :placeholder="$t('奖励票券名称')">
                            <el-option v-for="item in getOptionData({ ticketType: row.ticketType })" :key="item.id" :label="item.name"
                                :value="+item.id" />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
            <div class="button" style="text-align: right;margin-top: 10px;">
                <el-button type="primary" @click="addInviteConfig">+</el-button>
                <el-button type="danger" @click="delInviteConfig" v-if="state.formData.inviteConfig.rewards?.length">-</el-button>
            </div>
        </el-form>

        <div class="title">{{ $t('成就奖励') }}</div>
        <el-form ref="addFrom" class="filter-form" :disabled="state.formDataDisabled">
            <el-form-item label="">
                <el-checkbox v-model="state.formData.meritConfig.open" style="margin-right: 10px;">{{ $t('已开启')
        }}</el-checkbox>
            </el-form-item>
            <div>{{ $t('统计起始时间（按首次开启时间记录）:') }} {{ state.formData.firstOpenTime ? dateFormat(state.formData.firstOpenTime) : '' }}</div>
            <div>{{ $t('受邀人完成合格条件后,邀请人按累计合格人数获得绩效奖励.该设置开启时,前台会显示邀请有奖页面') }}</div>
            <el-form-item :label="$t('计算周期')">
                <el-radio disabled v-model="radio" :value="1" :label="1">{{ $t('永久')}}</el-radio>
            </el-form-item>
            <el-table class="table-box wd550" :data="state.formData.meritConfig.rewards" border>
                <el-table-column :label="$t('累计合格人数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.validNum" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="1"
                            :max="99999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.reward" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0.1"
                            :max="10000000" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('稽核倍数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.auditMultiple" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="0"
                            :max="9999999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励票券类型')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-select style="width: 200px" v-model="row.ticketType" :placeholder="$t('奖励票券类型')" @change="row.ticketId = ''">
                            <el-option v-for="item in metaData.ticketType" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励票券名称')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-select style="width: 200px" v-model="row.ticketId" :placeholder="$t('奖励票券名称')">
                            <el-option v-for="item in getOptionData({ ticketType: row.ticketType })" :key="item.id" :label="item.name"
                                :value="+item.id" />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
            <div class="button" style="text-align: right;margin-top: 10px;">
                <el-button type="primary" @click="addMeritConfig">+</el-button>
                <el-button type="danger" @click="delMeritConfig" v-if="state.formData.meritConfig.rewards?.length">-</el-button>
            </div>
        </el-form>

        <div class="title">{{ $t('充值返佣') }}</div>
        <el-form ref="addFrom" class="filter-form" :disabled="state.formDataDisabled">
            <el-form-item label="">
                <el-checkbox v-model="state.formData.rechargeConfig.open" style="margin-right: 10px;">{{ $t('已开启')
        }}</el-checkbox>
            </el-form-item>
            <div style="margin-bottom: 10px;">{{ $t('邀请人可从受邀用户在平台存款时,按充值比例或固定金额赚取佣金') }}</div>
            <el-table class="table-box wd550" :data="[state.formData.rechargeConfig]" border>
                <el-table-column :label="$t('前日直属存款≥')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.beforeRecharge" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="1"
                            :max="10000000" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('充值返佣比例%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.rate" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0.1"
                            :max="10000" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('稽核倍数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.auditMultiple" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="0"
                            :max="9999999" />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>

        <div class="title" style="margin-top: 42px;">{{ $t('投注返佣') }}</div>
        <el-form ref="addFrom" class="filter-form" :disabled="state.formDataDisabled">
            <el-form-item label="">
                <el-checkbox v-model="state.formData.playConfig.open" style="margin-right: 10px;">{{ $t('已开启')
        }}</el-checkbox>
            </el-form-item>
            <div style="margin-bottom: 10px;">{{ $t('每成功推荐一位新用户,邀请人可在受邀用户投注交易时赚取佣金') }}</div>
            <el-table class="table-box wd550" :data="state.formData.playConfig.rewards" border>
                <el-table-column :label="$t('投注返佣层级')" prop="level" align="center" min-width="120">
                </el-table-column>
                <el-table-column :label="$t('电子%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.digitalRate" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0"
                            :max="100" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('捕鱼%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.fishRate" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0"
                            :max="100" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('棋牌%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.tableRate" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0"
                            :max="100" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('真人%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.liveRate" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0"
                            :max="100" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('体育%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.sportRate" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="2" :min="0"
                            :max="100" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('稽核倍数')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number v-model="row.auditMultiple" class="wd140" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="0"
                            :max="9999999" />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>

        <div class="btn-box">
            <el-button v-throttle type="primary" @click="state.formDataDisabled = false" v-if="state.formDataDisabled">
                {{ $t('修 改') }}
            </el-button>
            <el-button v-throttle @click="state.formDataDisabled = true; getConfigShareBenefit()" v-if="!state.formDataDisabled">
                {{ $t('取 消') }}
            </el-button>
            <el-button v-throttle type="primary" @click="saveConfigShareBenefit(addFrom)" v-if="!state.formDataDisabled">
                {{ $t('保 存') }}
            </el-button>
        </div>

    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { getMetaData, postMetaData } from "@/api/common.js"
import { getCommonMeta, getTicketList } from "@/api/common"
import { dateFormat } from "@/common/util/index"

let metaData = reactive({
    gameType: [],
    ticketType: [],
})
const radio = ref(1)
const state = reactive({
    formData: {
        inviteConfig: {
            open: false,
            rewards: []
        },
        meritConfig: {
            open: false,
            rewards: []
        },
        rechargeConfig: {},
        playConfig: {
            open: false,
            rewards: [{ level: 1 }, { level: 2 }, { level: 3 }]
        }
    },
    formDataDisabled: true,
    ticketList: []
})
const addFrom = ref(null)

onMounted(() => {
    getCommonMeta({ types: 'gameType,ticketType' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
        metaData.gameType.unshift({ value: 9999, label: '全部' })
    })
    getTicketData()
    getConfigShareBenefit()
})

// 获取票券数据
const getTicketData = () => {
    getTicketList({
        status: 1,
        _size: 999,
        _page: 1,
    }).then(({ data }) => {
        state.ticketList = data?.list || []
    })
}

const getConfigShareBenefit = () => {
    getMetaData({ type: 53 }).then((res) => {
        if (Object.values(res.data).length) {
            const obj = Object.values(res.data)[0]
            const config = obj.value ? JSON.parse(obj.value) : {}
        // const config = res.data['定制版代理基础配置']?.config || {}
        state.formData.open = config.open
        state.formData.bindPhone = config.bindPhone
        state.formData.ipUnique = config.ipUnique
        state.formData.bindCash = config.bindCash
        state.formData.recharge = config.recharge
        state.formData.gameType = config.gameType || 9999
        state.formData.playCoin = config.playCoin
        state.formData.firstOpenTime = config.meritConfig?.firstOpenTime
        state.formData.inviteConfig = config.inviteConfig || { rewards: [] }
        state.formData.meritConfig = config.meritConfig || { rewards: [] }
        state.formData.rechargeConfig = config.rechargeConfig || {}
        state.formData.playConfig = config.playConfig || {
            open: false,
            rewards: [{ level: 1 }, { level: 2 }, { level: 3 }]
        }
        state.id = obj.id
        }
    })
}

// 获取指定类型的票券数据
const getOptionData = ({ ticketType, ticketName, ticketId }) => {
    let arr = state.ticketList.filter(item => item.type == ticketType)
    if (ticketId && arr.every(item => item.id !== ticketId)) arr.unshift({
        id: ticketId,
        type: ticketType,
        name: ticketName + $t('（已停用）'),
        isDisabled: true
    })
    return arr
}

const addInviteConfig = () => {
    state.formData.inviteConfig.rewards.push({})
}

const delInviteConfig = () => {
    state.formData.inviteConfig.rewards.pop()
}

const addMeritConfig = () => {
    state.formData.meritConfig.rewards.push({})
}

const delMeritConfig = () => {
    state.formData.meritConfig.rewards.pop()
}

const saveConfigShareBenefit = (el) => {
    const obj = {
        open: state.formData.open,
        bindPhone: state.formData.bindPhone,
        ipUnique: state.formData.ipUnique,
        bindCash: state.formData.bindCash,
        recharge: state.formData.recharge,
        gameType: state.formData.gameType,
        playCoin: state.formData.playCoin,
        inviteConfig: state.formData.inviteConfig,
        meritConfig: state.formData.meritConfig,
        rechargeConfig: state.formData.rechargeConfig,
        playConfig: state.formData.playConfig,
    }
    if (obj.recharge === 0) delete obj.recharge
    if (obj.playCoin === 0) delete obj.playCoin
    if (obj.gameType == 9999) delete obj.gameType
    let params = {
        config: JSON.stringify(obj),
        type: 53,
        // label: $t('定制版代理基础配置'),
        id: state.id || '',
    }
    globalVBus.$emit('globalLoading', true)
    postMetaData(params).then(() => {
        getConfigShareBenefit()
        state.formDataDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const addRobot = () => {
    state.robotList.push({})
}

const delRobot = (robotIndex) => {
    state.robotList = state.robotList.filter((_, index) => index !== robotIndex);
}

</script>

<style lang="scss" scoped>
.three-agent-configuration {
    height: calc(100% - 55px);
    overflow-y: auto;
    .title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    .btn-box {
        padding-left: 600px;
        width: 100%;
        margin-top: 40px;
    }

    .filter-form {
        width: 1400px;
        padding-left: 50px;
    }

    .wd140 {
        width: 140px;
    }

    .wd550 {
        width: 1400px;
    }

    .tips {
        line-height: 20px;
        margin-top: 10px;
    }
    .item-label{
        color: #606266;
        margin-left: 30px;
    }
    .item-label.item-disabled{
        color: #a8abb2 !important;
    }
}
</style>

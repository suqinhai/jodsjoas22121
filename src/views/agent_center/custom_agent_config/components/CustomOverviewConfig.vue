<template>
    <!-- 代理中心-C版概览配置 -->
    <div class="custom-overview-config">
        <div class="title">{{ $t('模块位置排序') }}</div>
        <el-form class="filter-form">
            <el-table :data="state.formData.moduleList" border style="width: 600px">
                <el-table-column :label="$t('类型')" align="center" min-width="180">
                    <template #default="{ row }">
                        {{ modeKey[row.id]}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('排序')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number style="width: 100%" :disabled="state.formDataDisabled" v-model="row.sort" :placeholder="$t('请输入排序')"
                            :controls="false" :precision="0" :min="1" :max="99" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('开关')" align="center" min-width="80">
                    <template #default="{ row }">
                        <el-switch v-if="[1,3,7].includes(row.id)" :disabled="state.formDataDisabled" v-model="row.flag" :active-value="1"
                            :inactive-value="0" />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <div class="title">{{ $t('当前收入设置') }}</div>
        <el-form class="filter-form">
            <div class="description">{{ $t('注：自定义配置数值，前端展示为系统配置数据+真实数据；') }}</div>
            <el-table class="table-box wd550" :data="state.tableList" border>
                <el-table-column prop="type" :label="$t('类型')" align="center" min-width="120" />
                <el-table-column :label="$t('系统金额')" align="center" min-width="120">
                    <template #default="{ row, $index }">
                        <el-input-number v-model="row[type[$index]].reward" class="wd140" :disabled="state.formDataDisabled" :placeholder="$t('请输入')"
                            :controls="false" :precision="2" :min="0.01" :max="9999999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('人数')" align="center" min-width="120">
                    <template #default="{ row, $index }">
                        <el-input-number v-model="row[type[$index]].num" class="wd140" :disabled="state.formDataDisabled" :placeholder="$t('请输入')"
                            :controls="false" :precision="0" :min="1" :max="9999999" />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <div class="title">{{ $t('排行榜设置') }}</div>
        <el-form class="filter-form">
            <div class="description">{{ $t('前端top3排名展示（注：真实会员-固定前面三个取真实会员数据，根据昨日变化显示）') }}</div>
            <el-table :data="state.formData.topRobots" border style="width: 600px">
                <el-table-column :label="$t('类型')" align="center" min-width="80">
                    <template #default="{ row }">
                        {{ row.type ? $t('真人') : $t('机器人')}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('会员名称')" align="center" min-width="180">
                    <template #default="{ row }">
                        <el-input style="width: 100%" :disabled="state.formDataDisabled || row.type" v-model="row.username" :placeholder="$t('会员名称')"
                            :maxlength="20" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励额度')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number style="width: 100%" :disabled="state.formDataDisabled || row.type" v-model="row.reward" :placeholder="$t('奖励额度')"
                            :controls="false" :precision="2" :min="1" :max="9999999999" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('操作')" align="center" min-width="65">
                    <template #default="{ row,$index }">
                        <el-button style="width: 40px" v-if="!row.type" :disabled="state.formDataDisabled" type="danger" @click="delRanking($index)">-
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="button" style="text-align: right;margin-top: 10px;">
                <el-button :disabled="state.formDataDisabled" type="primary" @click="addRanking" v-if="state.formData.topRobots.length < 10">+
                </el-button>
            </div>
        </el-form>
        <div class="title">{{ $t('领奖记录') }}</div>
        <el-form class="filter-form">
            <el-form-item label="">
                <el-checkbox v-model="state.formData.open" :disabled="state.formDataDisabled" style="margin-right: 10px;">{{ $t('已开启') }}
                </el-checkbox>
                {{ $t('真实人数少于等于') }}
                <el-input-number :disabled="state.formDataDisabled" v-model="state.formData.realNum" class="wd200" style="margin:0 10px;"
                    :placeholder="$t('请输入')" :controls="false" :min="0" :precision="0" />
                {{ $t('人时触发') }}
            </el-form-item>
            <el-table class="table-box wd550" :data="state.robotList" border>
                <el-table-column :label="$t('会员名称')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input style="width: 100%" :disabled="state.formDataDisabled" v-model="row.username" :placeholder="$t('请输入')"
                            :maxlength="50" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励额度')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number :disabled="state.formDataDisabled" v-model="row.reward" class="wd140" :placeholder="$t('请输入')"
                            :controls="false" :precision="2" :min="1" :max="9999999" />
                    </template>
                </el-table-column>
            </el-table>
            <div class="button" style="text-align: right;margin-top: 10px;">
                <el-button :disabled="state.formDataDisabled" type="primary" @click="addRobot">+</el-button>
                <el-button :disabled="state.formDataDisabled" type="danger" @click="delRobot" v-if="state.robotList.length">-</el-button>
            </div>
        </el-form>
        <div class="title">{{ $t('收入目标说明（显示于问号内容）') }}</div>
        <el-form class="filter-form">
            <el-input type="textarea" :rows="6" :placeholder="$t('请输入规则文本')" :disabled="state.formDataDisabled" v-model="state.formData.incomeDesc"
                show-word-limit maxlength="2000" style="width: 550px;" />
        </el-form>
        <div class="title">{{ $t('邀请预估收入设置') }}</div>
        <el-form ref="incomeRef" :disabled="state.formDataDisabled" label-width="auto" :model="state.formData" :rules="state.rules">
            <el-form-item :label="$t('有效邀请人数:')" prop="validInviteNum">
                <el-input-number v-model="state.formData.validInviteNum" :placeholder="$t('请输入有效邀请人数')" :controls="false" :precision="0" :min="1"
                    :max="9999999" />
            </el-form-item>
            <el-form-item :label="$t('预估收入:')" prop="preIncome">
                <div style="width: 100%;">
                    <el-input-number v-model="state.formData.preIncome" :placeholder="$t('请输入预估收入')" :controls="false" :precision="2" :min="0"
                        :max="9999999999" />
                </div>
                <div>{{$t('注：配置后显示收入试算数值，同时预估收益显示额度')}}</div>
            </el-form-item>
        </el-form>

        <div class="btn-box">
            <el-button v-throttle type="primary" @click="state.formDataDisabled = false" v-if="state.formDataDisabled">
                {{ $t('修 改') }}
            </el-button>
            <el-button v-throttle @click="state.formDataDisabled = true; getConfigShareBenefit()" v-if="!state.formDataDisabled">
                {{ $t('取 消') }}
            </el-button>
            <el-button v-throttle type="primary" @click="saveConfigShareBenefit(incomeRef)" v-if="!state.formDataDisabled">
                {{ $t('保 存') }}
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMetaData, postMetaData } from "@/api/common"

const modeKey = {
    1: $t('返佣等级'),
    2: $t('当前已发放'),
    3: $t('收入目标'),
    4: $t('数据统计'),
    5: $t('分享链接'),
    6: $t('排行榜'),
    7: $t('收入试算'),
}
const type = ['inviteReward', 'meritReward', 'rechargeReward', 'playReward']
const state = reactive({
    id: '',
    tableList: [{
        type: $t('邀请奖励'),
        inviteReward: {}
    }, {
        type: $t('成就奖励'),
        meritReward: {}
    }, {
        type: $t('充值奖励'),
        rechargeReward: {}
    }, {
        type: $t('投注奖励'),
        playReward: {}
    }],
    robotList: [],
    formData: {
        open: false,
        topRobots: [],
        moduleList: [],
    },
    rules: {
        validInviteNum: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        preIncome: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
    },
    formDataDisabled: true
})
const incomeRef = ref(null)

onMounted(() => {
    state.formData.moduleList = [
        { id: 1, sort: 7, flag: 1 },
        { id: 2, sort: 6, flag: 1 },
        { id: 3, sort: 5, flag: 1 },
        { id: 4, sort: 4, flag: 1 },
        { id: 5, sort: 3, flag: 1 },
        { id: 6, sort: 2, flag: 1 },
        { id: 7, sort: 1, flag: 1 },
    ]
    getConfigShareBenefit()
})


const getConfigShareBenefit = () => {
    getMetaData({ type: 52 }).then((res) => {
        if (Object.values(res.data).length) {
            const obj = Object.values(res.data)[0]
            const config = obj.value ? JSON.parse(obj.value) : {}
            state.id = obj.id
            state.tableList[0].inviteReward = config.inviteReward || {}
            state.tableList[1].meritReward = config.meritReward || {}
            state.tableList[2].rechargeReward = config.rechargeReward || {}
            state.tableList[3].playReward = config.playReward || {}
            state.formData.open = config.robot?.open || false
            state.formData.realNum = config.robot?.realNum || undefined
            state.robotList = config.robot?.robotList || []
            state.formData.topRobots = config.topRobots || []
            state.formData.incomeDesc = config.incomeDesc || ''
            state.formData.validInviteNum = config.validInviteNum || undefined
            state.formData.preIncome = config.preIncome || undefined
            if (config.moduleList && config.moduleList.length) state.formData.moduleList = config.moduleList
            state.formData.moduleList.sort((a, b) => b.sort - a.sort)
        }
    })
}

const saveConfigShareBenefit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { validInviteNum, preIncome, incomeDesc, moduleList, open, realNum, topRobots } = state.formData
            const obj = {
                inviteReward: state.tableList[0].inviteReward,
                meritReward: state.tableList[1].meritReward,
                rechargeReward: state.tableList[2].rechargeReward,
                playReward: state.tableList[3].playReward,
                robot: {
                    open,
                    realNum,
                    robotList: state.robotList
                },
                incomeDesc,
                validInviteNum,
                preIncome,
                topRobots: topRobots.filter(item => !item.type && item.username && item.reward),
                moduleList: moduleList.map(item => { return { ...item, sort: item.sort || 1 } }),
            }
            let params = {
                config: JSON.stringify(obj),
                type: 52,
                id: state.id,
            }
            globalVBus.$emit('globalLoading', true)
            postMetaData(params).then(() => {
                getConfigShareBenefit()
                state.formDataDisabled = true
                globalVBus.$emit('globalLoading', false)
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const addRobot = () => {
    state.robotList.push({})
}

const delRobot = () => {
    state.robotList.pop()
}

const addRanking = () => {
    state.formData.topRobots.push({
        type: 0,
    })
}

const delRanking = (index) => {
    state.formData.topRobots.splice(index, 1)
}

</script>

<style lang="scss" scoped>
.custom-overview-config {
    height: calc(100% - 55px);
    overflow-y: auto;
    .title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    .btn-box {
        width: fit-content;
        margin-left: 300px;
        margin-top: 40px;
    }

    .filter-form {
        width: 600px;
        padding-left: 50px;
        margin-bottom: 30px;
    }

    .wd140 {
        width: 140px;
    }

    .wd550 {
        width: 550px;
    }

    .tips {
        line-height: 20px;
        margin-top: 10px;
    }
    .description {
        margin-bottom: 10px;
    }
}
</style>

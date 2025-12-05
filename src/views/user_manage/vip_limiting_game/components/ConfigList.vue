<template>
    <!-- vip等级额度上限配置列表 -->
    <div class="containers vip-limiting-game-config">
        <div class="table-warp">
            <div class="tips-w">
                <p style="color: red;">{{$t('注：配置数值只可大于等于（≥）上一个等级')}}</p> 
            </div>
            <el-form ref="formRef" :model="state" status-icon :validate-on-rule-change="false">
                <el-form-item>
                    <el-checkbox v-model="state.onOff" :label="$t('已开启（开启后才会触发会员vip等级额度上限判断）')" :true-label="1" :false-label="0" :disabled="state.isDisabled"></el-checkbox>
                </el-form-item>
                <el-table class="table-box" :data="state.tableData" border height="auto">
                    <el-table-column :label="$t('vip等级')" min-width="100" align="center">
                        <template #default="{ row }">
                            <span class="">{{$t('VIP')}} {{row.level || 0}}</span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column :label="$t('触发上限余额')" min-width="180" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="`tableData.${$index}.limit`" :rules="[
                                {
                                    required: true,
                                    message: '',
                                    trigger: ['blur', 'change']
                                },
                                {
                                    validator: validateMinBalance,
                                    trigger: ['blur', 'change']
                                },
                                {
                                    pattern: /^\d+$/,
                                    message: '',
                                    trigger: ['blur', 'change']
                                }
                            ]">
                                <el-input v-model.number="row.limit" 
                                         :placeholder="$t('最小输入{min}', { min: triggerBalanceMap[country] || 0 })"
                                         :disabled="state.isDisabled" 
                                         @blur="() => validateField($index)"
                                         @change="() => validateField($index)"
                                         class="no-suffix-input"/>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('当前触发人数')" min-width="100" align="center">
                        <template #default="{ row }">
                            <span class="special pointer" @click="currentNumber(row)">{{row.num || 0}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('前端提示语')" min-width="340" align="center">
                        <template #default="{ row }">
                            <el-input v-model="row.tip" :disabled="state.isDisabled"  :placeholder="$t('请输入前端提示内容')" :maxlength="1000" show-word-limit />
                        </template>
                    </el-table-column>
                </el-table>
                <!-- <div class="tip">
                    <div class="tips">
                    {{$t('处理会员前端提示（被处理后的会员，进入控制游戏时提示）')}}
                    </div>
                    <el-input v-model="state.tip" type="textarea" style="width: 800px;" :rows="8" :placeholder="$t('请填写前端提醒内容')"
                            maxlength="500" show-word-limit :disabled="state.isDisabled" />
                </div> -->
            </el-form>
        </div>
        <div class="btn-warp operate" v-permiss="'merchant.vip-balance-ctrl.levelLimitEdit'">
            <el-button v-throttle v-if="!state.isDisabled" @click="getHomeData('loadingPage',false)">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:20px" type="primary" v-if="!state.isDisabled" @click="handleSubmit">{{$t('保存')}}
            </el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>

    </div>
</template>

<script setup>
import { getLevelLimitList, postLevelLimitEdit, getLimitList, postKickOffline, getLimitLogList } from '@/api/member'
import { getUserBaseDetail } from '@/api/common'
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { useRouter } from 'vue-router'
import commonStore from '@/store/common'


const commonData = commonStore()
const router = useRouter()
const userData = userStore()
const props = defineProps({
    userLevel: {
        type: Array,
        default: () => [],
    },
})

const formRef = ref(null)

const state = reactive({
    onOff: false,
    isDisabled: true,
    tableData: [],
    limits: '',
    tip: '',
})

const triggerBalanceMap = {
    'BR': 100,//巴西--
    'PH': 1000, //菲律宾
    'ID': 300000,//印尼
    'IN': 1500 ,//印度
    'VN': 450,//越南
    'TH': 500 ,//泰国---
    'PK': 5000,//巴基斯坦
    'BD': 2000,//孟加拉
    'MX': 100, //墨西哥 
    'NG': 25000, //尼日利亚
    'AR': 25000, //阿根廷 
    'KE': 2500, //肯尼亚---
    'CO': 27000, //哥伦比亚
    'UZ': 100,  //U站
}

const country = computed(() => {
    return userData.merchantInfo.country || ''
})

const validateMinBalance = (rule, value, callback) => {
    const minValue = triggerBalanceMap[country.value] || 0;
    if (value !== '' && value !== null && value !== undefined && value < minValue) {
        callback(new Error($t('请输入正确的金额！')));
    } else {
        callback();
    }
}

const validateField = ($index) => {
    if (formRef.value) {
        formRef.value.validateField(`tableData.${$index}.limit`);
    }
}

const getHomeData = (part = '', init = true) => {
     state.isDisabled = true
     clearFormErrors()
     getLevelLimitLists()
}
const clearFormErrors = () => {
    if (formRef.value) {
        formRef.value.clearValidate()
    }
}

const currentNumber = (row) => {
    router.replace({
        path: '/user-manage/vip-limiting-game',
        query: {
            type: '0',
            level: row.level,
            merchantId: commonData.currentMerchantSite.id
        }
    })
}


const getLevelLimitLists = () => {
    getLevelLimitList().then(res => {
        if (res.code === 0) {
            const { onOff, rules, tip } = res.data || {}
            state.onOff = onOff
            state.tip = tip
            state.tableData = rules.map(it => {
                return {
                    level: it.level,
                    limit: it.limit || '',
                    num: it.num || 0,
                    tip: it.tip || ''
                }
            })
        }
    })
}
onMounted(() => {
    getLevelLimitLists()
})


const handleSubmit = () => {
    if (formRef.value) {
        formRef.value.validate((valid) => {
            if (valid) {
                const params = formatData()
                postLevelLimitEdit(params).then(res => {
                    if (res.code === 0) {
                        getLevelLimitLists()
                        state.isDisabled = true
                    }
                })
            } else {
                ElMessage.warning($t('请完善表单内容再进行提交！'))
                return false
            }
        })
    }
}

const formatData = () => {
    const { onOff, tableData, tip } = state || {}
    const rules = tableData.map(it => {
        return {limit: it.limit, tip: it.tip}
    })
    return {
        rules: rules,
        onOff,
        tip,
    }
}

</script>
<style lang="scss">
.vip-limiting-game-config{
    padding-bottom: 30px !important;
    .operate{
        margin-bottom: 20px;
        text-align: right;
        
    }
    .table-warp{
        width: 800px;
    }
    .tips{
        color:#606266;
        margin: 30px 0 10px 0;
    }
    .btn-warp{
        margin-top: 50px;
        width: 800px;
        text-align: center;
    }

}

/* 隐藏输入框后缀元素 */
:deep(.no-suffix-input .el-input__suffix) {
  display: none !important;
}
</style>
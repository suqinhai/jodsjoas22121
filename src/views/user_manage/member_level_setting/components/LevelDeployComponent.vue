<template>
    <!-- 用户管理-层级设置-层级配置（自动、固定） -->
    <div class="level-table">
        <div class="operate">
            <el-button v-throttle v-if="isPermiss && !state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="isPermiss && !state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
            <el-button v-throttle type="primary" v-if="isPermiss && state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
        </div>

        <el-form ref="deployForm" :model="state.formData">
            <el-table class="table-box" :data="state.formData" style="width: 100%" border>
                <el-table-column prop="id" label="ID" width="80" align="center" />
                <el-table-column prop="name" :label="$t('层级名称')" min-width="150" align="center">
                    <template #default="{ row,$index }">
                        <div v-if="state.isDisabled || (row.id === 0 && !props.levelType)">{{row.name}}</div>
                        <el-form-item v-else :prop="$index + '.name'" :rules="[
                                {
                                    required: true,
                                    message: '',
                                    trigger: 'blur',
                                },
                            ]" label-width="0">
                            <el-input :disabled="state.isDisabled" v-model="row.name" style="width: 100%" :placeholder="$t('层级名称')" maxlength="10"
                                show-word-limit />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('层级描述')" min-width="300" align="center">
                    <template #default="{ row }">
                        <div v-if="state.isDisabled  || (row.id === 0 && !props.levelType)">{{row.remark}}</div>
                        <el-input :disabled="state.isDisabled" v-else v-model="row.remark" style="width: 100%" :placeholder="$t('层级描述')"
                            maxlength="50" show-word-limit />
                    </template>
                </el-table-column>
                <template v-if="levelType !== 1">
                    <el-table-column :label="$t('累计充值金额')" min-width="130" align="center">
                        <template #default="{ row,$index }">
                            <div v-if="state.isDisabled  || (row.id === 0 && !props.levelType)">{{row.sum }}</div>
                            <el-form-item v-else :prop="$index + '.sum'" :rules="[
                                {
                                    required: true,
                                    message: '',
                                    trigger: 'blur',
                                },
                            ]" label-width="0">
                                <el-input-number :disabled="state.isDisabled" v-model="row.sum" style="width: 100%" :controls="false" :precision="0"
                                    :min="0" :placeholder="$t('累计充值金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('充值次数')" min-width="130" align="center">
                        <template #default="{ row,$index }">
                            <div v-if="state.isDisabled  || (row.id === 0 && !props.levelType)">{{row.num }}</div>
                            <el-form-item v-else :prop="$index + '.num'" :rules="[
                                {
                                    required: true,
                                    message: '',
                                    trigger: 'blur',
                                },
                            ]" label-width="0">
                                <el-input-number :disabled="state.isDisabled" v-model="row.num" style="width: 100%" :controls="false" :precision="0"
                                    :min="0" :placeholder="$t('充值次数')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column min-width="140" align="center">
                        <template #header>
                            <div>{{$t('盈利额度')}}</div>
                            <!-- <div>{{$t('(余额+提现-充值)')}}</div> -->
                        </template>
                        <template #default="{ row }">
                            <div v-if="state.isDisabled  || (row.id === 0 && !props.levelType)">{{row.diff }}</div>
                            <el-input-number v-else :disabled="state.isDisabled" v-model="row.diff" style="width: 100%" :controls="false"
                                :precision="0" :placeholder="$t('盈利额度')" />
                        </template>
                    </el-table-column>
                </template>
                <el-table-column :label="$t('限制类型')" width="130" align="center" v-if="levelType">
                    <template #default="{ row }">
                        <template v-if="row.status_">
                            <div v-for="(item,index) in  row.status_.split('\n')" :key="index">{{item}}</div>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('限制操作')" min-width="100" align="center" v-if="isPermiss && levelType">
                    <template #default="{ row }">
                        <el-dropdown @command="handleOperate" v-if="typeof row.id === 'number'">
                            <el-button v-throttle type="primary" text>{{$t('限制类型')}}<el-icon class="el-icon--right">
                                    <arrow-down />
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="item in provideData.userHandleType" :key="item.value"
                                        :command="row.id + ',' + item.value">
                                        {{item.label}}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" :label="$t('操作')" width="150" align="center" v-if="isPermiss">
                    <template #default="{ row,$index }">
                        <el-button v-throttle :disabled="state.isDisabled" class="but" type="primary" @click="handleAdd($index)" :icon="Plus">
                        </el-button>
                        <el-button v-throttle :disabled="state.isDisabled" class="but" v-if="state.formData.length > 1 && row.id !== 0" type="danger"
                            @click="handleDel($index)" :icon="Minus">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue'
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import userStore from '@/store/user'
import { getLevelList, postLevelData } from '@/api/risk_control'
import { operateMemberConfig } from '@/api/member'
import { deepClone } from '@/common/util'

const emits = defineEmits(['showDialog'])
const props = defineProps({
    levelType: {
        type: Number,
        default: 0
    }
})
let state = reactive({
    formData: [],
    initData: [],
    isDisabled: true
})
const userData = userStore()
const deployForm = ref(null)
const provideData = inject('provideData')

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.merchant-layer-config.edit')
})

onMounted(() => {
    getData()
})

const getData = () => {
    provideData.showLoading()
    getLevelList({ type: props.levelType, merchantId: provideData.merchantId }).then((res) => {
        state.isDisabled = true
        state.initData = deepClone(res.data || [])
        state.formData = res.data || []
        if (!state.formData.length && props.levelType) {
            let obj = {
                name: '',
                remark: '',
            }
            state.formData.push(obj)
            state.isDisabled = false
        }
        provideData.closeLoading()
    }).catch(() => {
        provideData.closeLoading()
    })
}

// 增加
const handleAdd = (index) => {
    let obj = {
        name: '',
        remark: '',
    }
    if (!props.levelType) {
        obj.num = undefined
        obj.sum = undefined
        obj.diff = undefined
    }
    state.formData.splice(index + 1, 0, obj)
}

// 删除
const handleDel = (index) => {
    state.formData.splice(index, 1)
}

// 人数详情/添加会员
const handleInfo = (row, key) => {
    if (key === 'levelSetShow' && !state.initData.length) return ElMessage.warning($t('请先配置层级再添加会员！'))
    emits('showDialog', {
        ...row,
        levelType: props.levelType,
        key,
        dataList: state.initData.filter(item => item.id).map(its => {
            return {
                id: its.id,
                name: its.name,
            }
        })
    })
}

// 限制
const handleOperate = (type) => {
    let arr = type.split(',')
    let obj = {
        handleLayerId: arr[0],
        type: arr[1],
        merchantId: provideData.merchantId
    }
    provideData.showLoading()
    operateMemberConfig(obj).then(res => {
        getData()
    }).catch(err => {
        provideData.closeLoading()
    })
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            provideData.showLoading()
            postLevelData({ type: props.levelType, value: JSON.stringify(state.formData), merchantId: provideData.merchantId }).then((res) => {
                getData()
            }).catch(() => {
                provideData.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang='scss' scoped>
.level-table {
    .operate {
        margin-bottom: 10px;
        display: flex;
        justify-content: flex-end;
    }
    .but {
        width: 40px;
    }
}
</style>
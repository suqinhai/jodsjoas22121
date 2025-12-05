<template>
    <!-- 财务中心-会员充值配置-转账充值配置-修改-支付方（线下） -->
    <Dialog ref="dialog" width="600" :title="$t('前台充值类型排序')" :isShowBottomButton="false" buttonCenter top="10vh" @cancel="emits('close')" @confirm="handleSubmit">
        <div class="sort-deploy-head">
            <div class="operate">
                <el-button v-throttle v-if="!state.isDisabled" @click="resetData">{{$t('取 消')}}</el-button>
                <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSubmit">{{$t('保 存')}}</el-button>
                <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
            </div>
        </div>
        <div class="pay-scope-deploy">
            <el-table style="width: 600px" :data="state.tableData" border :disabled="false">
                <el-table-column :label="$t('排序')" min-width="50" align="center">
                    <template #default="{ row,$index }">
                        <span v-if="state.isDisabled">{{ row.sort }}</span>
                        <el-form-item v-if="!state.isDisabled" :prop="$index + '.sort'"
                            :rules="{ required: true, message: $t('请输入排序值') + '！', trigger: 'blur' }">
                            <el-input-number v-model="row.sort" style="width: 100%" :controls="false" :precision="0" :min="0"
                                :placeholder="$t('请输入排序值')" />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('支付方式名称')" align="center">
                    <template #default="{ row }">
                        <span v-if="row.isOld">{{row.label}}</span>
                        <el-input v-else style="width: 100%" @input="(val) => row.label = val.replace(/[\u4E00-\u9FFF]/g,'')" v-model="row.label"
                            :maxlength="40" show-word-limit :placeholder="$t('输入支付方式名称')" />
                    </template>
                </el-table-column>
            </el-table>
            <!-- <div class="operate-box">
                <el-button v-throttle :disabled="state.isDisabled" v-if="isCanDel && state.tableData.length > 0" type="danger" @click="handleDel" :icon="Minus">
                </el-button>
                <el-button v-throttle :disabled="state.isDisabled" type="primary" @click="handleAdd" :icon="Plus"></el-button>
            </div> -->
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus } from "@element-plus/icons-vue"
import userStore from '@/store/user'
import { postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'

const emits = defineEmits(['close', 'getData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    tableData: [],
    isDisabled: true
})
const dialog = ref(null)
const userData = userStore()

const isCanDel = computed(() => {
    return state.tableData.some(item => !item.isOld)
})

onMounted(() => {
    resetData()
})


const resetData = () => {
    if (props.itemData.value) {
        state.tableData = sortBySortKey(props.itemData.value).map(item => {
            return {
                label: item.label,
                isOld: true,
                sort: item.sort,
            }
        })
    }
    state.isDisabled = true
}

const sortBySortKey =(data)=> {
  const arr = typeof data === 'string' ? JSON.parse(data) : data;
  const sorted = arr.sort((a, b) => a.sort - b.sort);
  return sorted;
}

const handleAdd = () => {
    state.tableData.push({ label: '' })
}

const handleDel = () => {
    state.tableData.pop()
}

const handleSubmit = () => {
    let arr = state.tableData.filter(item => item.label)
    if (!arr.length) return ElMessage.warning($t('请至少配置一种支付方式再进行提交！'))
    ElMessageBox.confirm($t('提交后只可增加不可修改，确认要提交吗？'), $t('提示'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        dialog.value.showLoading()
        let params = deepClone(props.itemData)
        params.value = JSON.stringify(arr.map((item,index) => {
            return {
                label:item.label,
                required: true,
                value: item.value,
                sort: item.sort
            }
        }))
        params.merchantId = userData.userInfo.groupId

        postMetaData(params).then(res => {
            emits('close')
            emits('getData')
        }).catch(err => {
            dialog.value.closeLoading()
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
.pay-scope-deploy {
    display: flex;
    align-items: flex-end;

    .operate-box {
        margin-left: 15px;
    }
}
.sort-deploy {
    margin-bottom: 40px;
    &-head {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        margin-top: -5px;
        .site-box {
            .label {
                font-weight: bold;
                margin-right: 10px;
            }
        }
        .operate {
            flex: 1;
            display: flex;
            justify-content: flex-end;
            padding-right: 0px;
        }
    }
}
</style>

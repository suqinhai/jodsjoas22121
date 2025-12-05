<template>
    <!-- 财务中心-会员提现配置-提现设置-提现类型设置 -->
    <Dialog ref="dialog" width="800" :title="$t('提现类型设置')" top="10vh" buttonCenter @cancel="cancel" @confirm="handleSubmit(deployFormRef)">
        <el-form class="withdrawal-type" ref="deployFormRef" :model="state.formData">
            <el-table :data="state.formData" border style="margin-bottom:10px" :span-method="arraySpanMethod">
                <el-table-column prop="title" :label="$t('提现类型')" min-width="100" align="center" />
                <el-table-column :label="$t('提现账号数量')" min-width="100" align="center">
                    <template #default="{ row,$index }">
                        <el-form-item :prop="$index + '.limit'" :rules="[{ required: true, message: '', trigger: 'blur' }]" label-width="0">
                            <el-input-number v-model="row.limit" style="width: 100%" :controls="false" :precision="0" :min="1" :max="30"
                                :placeholder="$t('输入1-30')" />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('前端附加选项')" min-width="200" align="center">
                    <template #default="{ row }">
                        <div class="select-all">
                            <el-checkbox v-model="row.checkAll" @change="onCheckAllChange(row)">{{ $t('全选') }}</el-checkbox>
                        </div>
                        <el-checkbox-group v-model="row.checkedList" @change="onGroupChange(row)">
                            <el-checkbox v-for="item in row.allowAdd" :key="item.value" :value="item.value" :label="item.value">{{ item.label }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('是否可删除账号')" min-width="100" align="center">
                    <template #default="{ row }">
                        <el-switch v-model="row.del" />
                    </template>
                </el-table-column>
            </el-table>
            <!-- <el-form-item :label="$t('前端提现附加选项:')">
                <el-checkbox-group v-model="state.checkedList">
                    <el-checkbox v-for="item in state.checkDataList" :key="item.value" :value="item.value" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item> -->
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postWithdrawalTypeConfig } from '@/api/finance'
import { deepClone } from '@/common/util'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        default: () => []
    },
})
const state = reactive({
    formData: [],
    checkDataList: [],
    checkedList: [],
    keyData: [],
})
const userData = userStore()
const deployFormRef = ref(null)
const dialog = ref(null)

const country = computed(() => {
    return userData.merchantInfo.country || ''
})

onMounted(() => {
    if (Object.keys(props.itemData).length) {
        // state.formData = Object.values(props.itemData)
        state.keyData = Object.keys(props.itemData)
        Object.values(props.itemData).forEach((item, index) => {
            if (item.type === 1 && userData.getTemplateType() === 4) {
                item.allowAdd.forEach((its, ins) => {
                    state.formData.push({
                        title: state.keyData[index] || '',
                        type: 1,
                        limit: its.limit || undefined,
                        allowAdd: [its],
                        del: its.del,
                        checkedList: item.allowAdd.some(ims => ims.checked && ims.value === its.value) ? [its.value] : [],
                        checkAll: item.allowAdd.some(ims => ims.checked && ims.value === its.value),
                        spanNum: !!ins ? 0 : item.allowAdd.length
                    })
                })
            } else {
                // if(!(item.type == 1 && country.value === 'UZ')){ // UZ排除万币
                item.title = item.type === 3 ? $t('线下转账') : state.keyData[index] || ''
                item.checkedList = item.allowAdd.filter(its => its.checked).map(its => its.value)
                item.checkAll = item.allowAdd.length > 0 && item.checkedList.length === item.allowAdd.length
                state.formData.push(item)
                // }
            }
        })
    }
})

const arraySpanMethod = ({ row, columnIndex }) => {
    if (columnIndex === 0 && row.type === 1 && userData.getTemplateType() === 4) {
        if (row.spanNum) {
            return {
                rowspan: row.spanNum,
                colspan: 1,
            }
        } else {
            return {
                rowspan: 0,
                colspan: 0,
            }
        }
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            if (userData.getTemplateType() === 4) {
                let arr = params.filter(item => item.type === 1)
                params = params.filter(item => item.type !== 1)
                if(arr.length){
                    params.push({
                        type: 1,
                        limit: 1,
                        open: false,
                        title: arr[0].title,
                        del: arr[0].del,
                        allowAdd: arr.map(its => {
                            return {
                                ...its.allowAdd[0],
                                del: its.del,
                                limit: its.limit,
                                checked: !!its.checkedList.length
                            }
                        })
                    })
                }
                
            }
            params.forEach(item => {
                if([1,2,5].includes(userData.getTemplateType())){
                    item.allowAdd.forEach(its => {
                        its.checked = item.checkedList.includes(its.value)
                    })
                }else{
                    if(item.type !== 1){
                        item.allowAdd.forEach(its => {
                            its.checked = item.checkedList.includes(its.value)
                        })
                    }
                }
            })

            dialog.value.showLoading()
            postWithdrawalTypeConfig({ config: JSON.stringify(params) }).then(() => {
                cancel()
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}

const onCheckAllChange = (row) => {
    if (row.checkAll) {
        row.checkedList = (row.allowAdd || []).map(it => it.value)
    } else {
        row.checkedList = []
    }
}

const onGroupChange = (row) => {
    const total = (row.allowAdd || []).length
    row.checkAll = total > 0 && (row.checkedList || []).length === total
}
</script>

<style lang="scss">
.withdrawal-type {
    .el-form-item {
        margin-bottom: 0px !important;
    }
    .el-checkbox-group {
        display: flex;
        flex-wrap: wrap;
        .el-checkbox {
            margin-right: 20px;
        }
    }
    .select-all {
        margin-bottom: 6px;
        text-align: left;
    }
}
</style>

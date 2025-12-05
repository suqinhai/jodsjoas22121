<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-新增/复制 -->
    <Dialog ref="dialogRef" width="650" :title="!itemData.id ? $t('新增活动') : $t('复制活动')" :operateActions="[$t('取消'), $t('创建')]" buttonCenter top="10vh"
        @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item>
                <el-radio-group :disabled="!!itemData.id" v-model="state.formData.operateType">
                    <el-radio :label="1">{{$t('自定义配置')}}</el-radio>
                    <el-radio :disabled="commonData.merchantSiteList.length <= 1" :label="2">{{$t('复制活动模版')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('选择活动:')" v-if="state.formData.operateType === 1" prop="type">
                <el-select :disabled="!!itemData.id" style="width: 300px" v-model="state.formData.type" :placeholder="$t('请选择活动类型')"
                    @change="state.formData.targetMerchantId = ''">
                    <el-option v-for="item in metaData.promotionType" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <template v-if="commonData.merchantSiteList.length > 1">
                <el-form-item :label="$t('选择站点:')" v-if="state.formData.operateType === 1" prop="targetMerchantId">
                    <MerchantSiteSelect :disabled="!state.formData.type" style="width: 300px" :optionData="optionData"
                        v-model="state.formData.targetMerchantId">
                    </MerchantSiteSelect>
                </el-form-item>
                <el-form-item :label="$t('选择站点:')" v-if="state.formData.operateType === 2" prop="targetMIds">
                    <MerchantSiteSelect style="width: 100%" multiple noStraddleType v-model="state.formData.targetMIds">
                    </MerchantSiteSelect>
                </el-form-item>
            </template>
            <template v-if="state.formData.operateType === 2">
                <div style="margin-bottom: 10px">
                    <el-input style="width: 200px" :placeholder="$t('请输入站点ID')" v-model="state.orgMerchantId" />
                    <el-button style="margin-left: 2%;" v-throttle type="primary" @click="getActivityTemplate">{{$t('搜 索')}}</el-button>
                </div>
                <el-checkbox v-if="state.tableData.length" :label="$t('是否全选')" :value="state.selectAll" @change="handleSelectAll" />
                <span class="special" style="float: right" v-if="state.newOrgMerchant.id">{{$t('站点ID:')}}
                    {{state.newOrgMerchant.id}}{{isClassify ? state.newOrgMerchant.custom ? '（定制版皮肤模版）' : '（普通皮肤模版）' : ''}}</span>
                <el-table ref="tableRef" :data="state.tableData" border>
                    <el-table-column width="45" prop="type_">
                        <template #default="{ row }">
                            <el-checkbox v-model="row.checked" :indeterminate="row.isIndeterminate" @change="handleCheckAllChange(row,$event)">
                            </el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('活动类型')" prop="type_" min-width="150" align="center" />
                    <el-table-column :label="$t('活动名')" min-width="360" align="center">
                        <template #default="{ row }">
                            <el-checkbox-group class="typeCheckboxGroup" v-model="row.checkedAlls" @change="handleCheckedCitiesChange(row,$event)">
                                <el-checkbox v-for="item in row.children" :key="item.id" :label="item.id" :value="item.id">
                                    {{item.promotionCond_}}
                                </el-checkbox>
                            </el-checkbox-group>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="deploy-tips">{{$t('注：请先搜索复制模版的站点ID，进行勾选配置，创建后将生成草稿')}}</div>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { getTemplateList, postSyncSpecPromotion } from "@/api/discounts_center"
import { filter } from 'lodash'

const emits = defineEmits(['fetchData', 'close', 'handleAdd'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    selectAll: false,
    tableData: [],
    orgMerchantId: '',
    newOrgMerchant: {},
    formData: {
        operateType: 1,
    },
    rules: {
        type: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        targetMIds: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        targetMerchantId: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
    }
})
const commonData = commonStore()
const dialogRef = ref(null)
const operateForm = ref(null)

const isClassify = computed(() => {
    return commonData.merchantSiteList.some(item => item.custom) && commonData.merchantSiteList.some(item => !item.custom)
})
const optionData = computed(() => {
    // 活动类型type: 1: 充值活动; 2: 打码活动; 3: 签到活动; 4: 救援金活动; 5: 幸运转盘; 6: 红包活动; 7: 推广活动; 8: 新人彩金活动; 9: 自定义活动;
    //  10: 闯关邀请活动; 12: 余额救援金活动; 13: 排行榜活动; 21: 兑换码; 22: 注册; 23: 幸运红包抽奖;
    // 2: 打码活动; 13: 排行榜活动 为通用活动类型
    // 21: 兑换码; 22: 注册; 23: 幸运红包抽奖; 24: 下载APP; 25: 登录奖励; 为定制模版站点专用
    // 5: 幸运转盘; 6: 红包活动; 7: 推广活动; 8: 新人彩金活动;10: 闯关邀请活动; 12: 余额救援金活动; 为普通模版站点专用
    // 1: 充值活动; 3: 签到活动; 4: 救援金活动;9: 自定义活动 为共用的活动类型，单配置存在差异，复制活动时，与活动站点模版类型不同的站点不能选择
    if (!isClassify.value) return commonData.merchantSiteList
    if (state.formData.type) {
        return commonData.merchantSiteList.map(item => {
            return {
                ...item,
                disabled: [2, 13].includes(state.formData.type) ? false : [1, 3, 4, 9].includes(state.formData.type) ? (!props.itemData.id ? false : props.itemData.merchant.custom !== item.custom)
                    : [21, 22, 23, 24, 25, 26].includes(state.formData.type) ? !item.custom : item.custom
            }
        })
    }
    if (!state.formData.type) return []

})

//监听是否全选
watch(
    () => state.tableData,
    (val) => {
        let status = true
        state.tableData.forEach((item) => {
            if (item.checkedAlls.length !== item.children.length) {
                status = false
            }
        })
        state.selectAll = status
    },
    { deep: true }
)

onMounted(() => {
    if (props.itemData.id) {
        let { type } = props.itemData
        state.formData.type = type
    }
})

//获取活动模板
const getActivityTemplate = async () => {
    if (!state.orgMerchantId) return ElMessage.warning($t('请输入站点ID再搜索！'))
    try {
        dialogRef.value.showLoading()
        let res = await getTemplateList({ orgMerchantId: state.orgMerchantId })
        if (res.code == 0) {
            state.newOrgMerchant = commonData.merchantSiteList.find(item => item.id === +state.orgMerchantId)
            state.tableData = disposalData(res.data)
        }
        dialogRef.value.closeLoading()
    } catch (err) {
        dialogRef.value.closeLoading()
    }
}

// 整理数据
const disposalData = (list) => {
    let newData = {}
    let newList = []
    list = list.filter(item => item.type !== 9)
    list.forEach((data) => {
        data.children = []
        data.checkedAlls = []
        data.checked = false
        data.isIndeterminate = false
        if (data.type === 2) data.promotionCond_ = data.cycleMode_ || ''
        if (data.type === 3 && state.newOrgMerchant.custom) data.promotionCond_ = data.name || ''
        if (!data.promotionCond_) data.promotionCond_ = data.type_
        if (data.rules && data.type === 7) {
            data.rules = JSON.parse(data.rules)
            data.promotionCond_ = data.rules.type === 1 ? $t('推广注册') : $t('推广')
        }
        newData[data.type_] = data
    })
    for (let key in newData) {
        list.forEach((data) => {
            if (key == data.type_) {
                newData[key].children.push(data)
            }
        })
    }
    for (let key in newData) {
        newList.push(newData[key])
    }
    return newList
}

const handleCheckAllChange = (row, val) => {
    row.checkedAlls = val ? row.children.map((data) => { return data.id }) : []
    row.isIndeterminate = false
}

const handleCheckedCitiesChange = (row, val) => {
    const checkedCount = val.length
    row.checked = checkedCount === row.children.length
    row.isIndeterminate = checkedCount > 0 && checkedCount < row.children.length
}

//是否全选
const handleSelectAll = (val) => {
    if (val) {
        state.tableData.forEach((item) => {
            item.checked = true
            item.isIndeterminate = false
            item.checkedAlls = item.children.map((data) => { return data.id })
        })
    } else {
        state.tableData.forEach((item) => {
            item.checked = false
            item.isIndeterminate = false
            item.checkedAlls = []
        })
    }
}

const handleSubmit = (el) => {
    el.validate(async (valid, fields) => {
        if (valid) {
            let { operateType, type, targetMIds, targetMerchantId } = state.formData
            if (operateType === 1) {
                let selectSite = commonData.merchantSiteList.find(item => item.id === targetMerchantId)
                if (props.itemData.id && selectSite.custom !== props.itemData.merchant.custom) return ElMessage.warning($t('选中的站点与复制内容站点皮肤类型不一致，请重新选择站点！'))
                emits('close')
                let obj = {
                    ...props.itemData,
                    type,
                    merchant: selectSite || commonData.currentMerchantSite,
                    // targetMIds: targetMerchantId || commonData.currentMerchantSite.id,
                    // custom: selectSite?.custom || commonData.currentMerchantSite.custom || false
                }
                emits('handleAdd', obj)
                return
            }
            let targetMIdList = targetMIds && targetMIds.length === 1 && !targetMIds[0] ? commonData.merchantSiteList : commonData.merchantSiteList.filter(item => targetMIds.includes(item.id))
            if (state.newOrgMerchant.custom !== targetMIdList[0].custom) return ElMessage.warning($t('存在与模版站点皮肤类型不一致的站点，请重新选择站点！'))
            // if (state.newOrgMerchant.custom !== commonData.currentMerchantSite.custom) return ElMessage.warning($t('当前站点与模版站点皮肤类型不一致的站点，请重新模版站点！'))
            let ids = [...state.tableData.filter(item => item.checkedAlls.length).map(item => item.checkedAlls)]
            if (!ids.length) return ElMessage.warning($t('请勾选活动类型'))
            if (targetMIds && targetMIds.length === 1 && targetMIds[0] === state.newOrgMerchant.id) return ElMessage.warning($t('自己的模板无法复制给自己，请选择其他站点再进行操作！'))
            let data = {
                ids: ids.join(','),
                orgMerchantId: state.newOrgMerchant.id,
                syncPromotionType: 0,
                targetMIds: targetMIds.filter(item => item !== state.newOrgMerchant.id).join(',')
            }
            // if (targetMIds && targetMIds.length === 1 && !targetMIds[0]) {
            //     data.targetMIds = commonData.merchantSiteList.filter(item => item.id !== state.newOrgMerchant.id).map(item => item.id).join(',')
            // } else {
            //     data.targetMIds = targetMIds.filter(item => item !== state.newOrgMerchant.id).join(',')
            // }
            try {
                dialogRef.value.showLoading()
                await postSyncSpecPromotion(data)
                emits('close')
                emits('fetchData')
            } catch (err) {
                dialogRef.value.closeLoading()
            }
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
.deploy-tips {
    color: red;
    margin-top: 5px;
}
</style>

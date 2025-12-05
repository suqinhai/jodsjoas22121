<template>
    <!-- 会员调控-数据列表（专业模式）-同IP比例配置 -->
    <Dialog ref="dialog" width="630" :title="$t('同IP比例配置')" top="10vh" @confirm="handleSubmit(formRef)" @cancel="emits('close')">
        <el-form ref="formRef" :model="state.formData" class="people-ratio-deploy">
            <div v-for="(item,index) in state.formData.limitOdds" :key="item" class="items-row">
                <span>{{$t('人数比例')}}</span>
                <el-form-item :prop="'limitOdds.' + index + '.num'" :rules="[{ required: true, message: $t('请输人数比例！'), trigger: 'change' }]" label-width="0">
                    <el-input-number v-model="item.num" :controls="false" :precision="2" :min="0.01" :max="100" :placeholder="$t('请输入人数比例')" />
                </el-form-item>
                <span>{{$t('%，控制类型')}}</span>
                <el-form-item :prop="'limitOdds.' + index + '.type'" :rules="[{ required: true, message: $t('请选择控制类型！'), trigger: 'change' }]" label-width="0">
                    <el-select v-model="item.type" :placeholder="$t('请选择控制类型')">
                        <el-option v-for="its in showData" :key="its.value" :label="its.label" :value="Number(its.value)" />
                    </el-select>
                </el-form-item>

                <div class="operate">
                    <el-button v-throttle type="primary" v-if="state.formData.limitOdds.length <= showData.length" @click="handleAdd(index)"
                        :icon="Plus"></el-button>
                    <el-button v-throttle v-if="state.formData.limitOdds.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                    </el-button>
                </div>
            </div>
            <div style="color: #999">{{$t('注：人数比例总和须为100%，多个配置且不可选择相同池子')}}！</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Minus } from "@element-plus/icons-vue"
import { postUserLevelControl } from '@/api/risk_control'
import { deepClone } from "@/common/util/index"

const emits = defineEmits(['close', 'save'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {
        limitOdds: []
    }
})
const formRef = ref(null)

const showData = computed(() => {
    return props.metaData.controlTypeList.filter(item => +item.value)
})

onMounted(() => {
    if (!props.itemData.limitOdds || !props.itemData.limitOdds.length) return state.formData.limitOdds = [
        { num: undefined, type: '' }
    ]
    state.formData.limitOdds = deepClone(props.itemData.limitOdds)
})

//删除等级
const handleDel = (index) => {
    state.formData.limitOdds.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.limitOdds.splice(index + 1, 0, {
        num: undefined,
        type: '',
    })
}

const handleSubmit = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            let params = deepClone(state.formData.limitOdds)
            let total = params.reduce((pre, item) => {
                return pre + (item.num * 100)
            }, 0)
            if (total !== 10000) {
                return ElMessage.warning($t('人数比例总和必须等于100%！'))
            }
            let isRepetition = false
            for (let index = 0; index < params.length; index++) {
                isRepetition = params.some(
                    (its, ins) => index !== ins && its.type === params[index].type,
                )
                if (isRepetition) break
            }
            if (isRepetition) return ElMessage.warning($t('控制类型不允许存在重复！'))
            dialog.value.showLoading()
            postUserLevelControl(params).then(() => {
                emits('close')
                emits('fetchData')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善概率配置表单内容再保存！'))
        }
    })
}
</script>

<style lang="scss">
.people-ratio-deploy {
    .items-row {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .el-form-item {
            margin-bottom: 0;
        }
        .operate {
            margin-left: 20px;
        }
        .el-input-number {
            width: 120px;
            margin: 0 5px;
        }
        .el-select {
            margin-left: 5px;
            .el-input__wrapper {
                width: 150px;
            }
        }
    }
}
</style>

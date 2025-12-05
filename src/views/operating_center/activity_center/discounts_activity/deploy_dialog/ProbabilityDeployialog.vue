<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-概率配置（充值活动、签到活动、红包活动、推广活动、新人彩金活动） -->
    <Dialog ref="dialog" width="710" :title="$t('概率配置')" top="10vh" :operateActions="[$t('取消'), $t('保存')]" @confirm="handleSubmit(formRef)" @cancel="emits('close')">
        <el-form ref="formRef" :model="state.formData" class="probability-deploy">
            <div class="title">{{$t('随机奖励范围：')}}{{probabilityData.rewardMinAmount || 0}}~{{probabilityData.rewardMaxAmount}}</div>
            <div v-for="(item,index) in state.formData.limitOdds" :key="item" class="items-row">
                <span>{{$t('奖励金额节点')}}</span>
                <el-form-item :prop="'limitOdds.' + index + '.limit'" :rules="[{ required: true, message: $t('请输入金额！'), trigger: 'blur' }]" label-width="0">
                    <el-input-number :disabled="state.formData.limitOdds.length === index + 1" v-model="item.limit" :controls="false" :precision="2"
                        :min="probabilityData.rewardMinAmount ? probabilityData.rewardMinAmount + 0.01 : 0.01" :max="probabilityData.rewardMaxAmount"
                        :placeholder="$t('请输入金额')" />
                </el-form-item>
                <span>{{$t('，概率')}}</span>
                <el-form-item :prop="'limitOdds.' + index + '.odds'" :rules="[{ required: true, message: $t('请输入概率！'), trigger: 'blur' }]" label-width="0">
                    <el-input-number v-model="item.odds" :controls="false" :precision="2" :min="0.01" :max="100" :placeholder="$t('请输入概率')" />%
                </el-form-item>

                <div class="operate">
                    <el-button v-throttle type="primary" v-if="state.formData.limitOdds.length < 10 && state.formData.limitOdds.length !== index + 1"
                        @click="handleAdd(index)" :icon="Plus"></el-button>
                    <el-button v-throttle v-if="state.formData.limitOdds.length > 2 && state.formData.limitOdds.length !== index + 1" type="danger"
                        @click="handleDel(index)" :icon="Minus">
                    </el-button>
                </div>
            </div>
            <div style="color: #999">{{$t('注：至少配置2个奖励金额节点，奖励金额节点不允许重复')}}！</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Minus } from "@element-plus/icons-vue"
import { deepClone } from "@/common/util/index"

const emits = defineEmits(['close', 'save'])
const props = defineProps({
    probabilityData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    formData: {
        limitOdds: []
    }
})
const formRef = ref(null)

onMounted(() => {
    if (!props.probabilityData.limitOdds || !props.probabilityData.limitOdds.length) return state.formData.limitOdds = [
        { limit: undefined, odds: undefined },
        { limit: props.probabilityData.rewardMaxAmount, odds: undefined }
    ]
    state.formData.limitOdds = deepClone(props.probabilityData.limitOdds)
})

//删除等级
const handleDel = (index) => {
    state.formData.limitOdds.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.limitOdds.splice(index + 1, 0, {
        limit: undefined,
        odds: undefined,
    })
}

const handleSubmit = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            let params = deepClone(state.formData.limitOdds)
            let total = params.reduce((pre, item) => {
                return pre + (item.odds * 100)
            }, 0)
            if (total !== 10000) {
                return ElMessage.warning($t('随机奖励概率总和必须等于100%！'))
            }
            let isRepetition = false
            for (let index = 0; index < params.length; index++) {
                isRepetition = params.some(
                    (its, ins) => index !== ins && its.limit === params[index].limit,
                )
                if (isRepetition) break
            }
            if (isRepetition) return ElMessage.warning($t('随机奖励金额不允许存在重复！'))
            params.sort((a, b) => a.limit - b.limit)
            emits('save', params)
            emits('close')
        } else {
            ElMessage.warning($t('请完善概率配置表单内容再保存！'))
        }
    })
}
</script>

<style lang="scss">
.probability-deploy {
    .title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
    }
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
    }
}
</style>

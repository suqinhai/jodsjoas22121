<template>
    <!-- 游戏获利监控-处理 -->
    <div class="dealDialog">
        <Dialog :title="$t('处理')" ref="dialog" @confirm="handleConfirm" @cancel="emit('close')" width="500">
            <el-form :inline="false" :label-width="$locale == 'zh' ? '90px' : 'auto'">
                <el-form-item :label="$t('会员账号：')">
                    {{ props.dealData.username }}
                </el-form-item>
                <el-form-item :label="$t('处理类型：')">
                    <el-radio-group v-model="params.status">
                        <el-radio v-for="item in props.statusList.slice(1)" :key="item" :label="item.value*1">
                            {{item.label.replace($t('已'),"")}}
                        </el-radio>
                    </el-radio-group>

                </el-form-item>
                <el-form-item :label="$t('备注：')">
                    <el-input v-model="params.remark" />
                </el-form-item>
            </el-form>

        </Dialog>
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, ref, watch } from "vue";
import { userProfitSpyAuditApi } from '@/api/risk_control'
import { ElMessage } from "element-plus";
const props = defineProps({
    dealData: {
        type: Object,
        default: () => { },
    },
    statusList: {
        type: Array,
        default: () => [],
    },
})
const emit = defineEmits(['close', 'refreshData'])
const Dialog = defineAsyncComponent(() =>
    import("@/components/Dialog/index.vue")
);

const params = reactive({
    remark: '',
    status: props.dealData?.status,
})

const handleConfirm = () => {
    params.id = props.dealData.id;
    userProfitSpyAuditApi(params).then(({ code }) => {
        if (code == 0) {
            // ElMessage.success($t('处理成功'))
            emit('close')
            emit('refreshData')
        }
    })
}
</script>

<style lang="scss" scoped></style>

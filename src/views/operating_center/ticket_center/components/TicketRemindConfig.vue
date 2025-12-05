<template>
    <!-- 运营中心-票券中心-提醒设置 -->
    <Dialog ref="dialog" width="500" :title="$t('提醒设置')" top="10vh" buttonCenter @confirm="handleSubmit" @cancel="cancel">
        <el-form label-width="auto">
            <el-form-item :label="$t('未使用票券提醒:')">
                <el-switch v-model="state.tip" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
            </el-form-item>
            <el-form-item :label="$t('首页下方轮播图:')">
                <el-switch v-model="state.bottom" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
            </el-form-item>
        </el-form>
        <div>{{$t('说明：未使用票券提醒：默认开启，开启后系统判断会员有未使用的票券，每次登录首页时，均弹框票券使用；首页下方轮播图：默认关闭，开启后则根据已有的票券类型图标，依次轮播，点击直接打开票券。')}}</div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { postMetaData } from "@/api/common"

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
        }
    },
})
const state = reactive({
    tip: true,
    bottom: false,
})
const dialog = ref(null)

onMounted(() => {
    let { id, value } = props.itemData
    if (id && value) {
        let obj = JSON.parse(value)
        state.tip = obj.tip
        state.bottom = obj.bottom
    }
})

const handleSubmit = () => {
    let params = {
        id: props.itemData.id || '',
        config: JSON.stringify(state),
        type: 47
    }
    dialog.value.showLoading()
    postMetaData(params).then(() => {
        cancel()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
</style>

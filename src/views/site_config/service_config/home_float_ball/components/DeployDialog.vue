<!--
 * @Author: yilaisai
 * @Date: 2025-04-18 10:36:14
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-04-18 15:24:07
-->
<template>
    <!-- 站点配置-客服配置-首页悬浮球配置-修改 -->
    <Dialog ref="dialog" width="750" buttonCenter :title="$t('修改')" top="5vh" @confirm="handleSubmit" @cancel="cancel">
        <el-form ref="operateForm" label-width="auto">
            <div>
                <el-form-item :label="$t('未选择状态:')">
                    <UploadImage v-model="state.unIcon" accept=".png,.jpg,.jpeg" :width="192" :height="192" />
                </el-form-item>
                <el-form-item :label="$t('已选择状态:')">
                    <UploadImage v-model="state.icon" accept=".png,.jpg,.jpeg" :width="192" :height="192" />
                </el-form-item>
                <el-form-item label=" ">
                    <div class="tips">{{$t("注：配置悬浮球为圆形，支持jpg，png格式，366*366规格，100kb以内")}}</div>
                </el-form-item>
            </div>
            <div v-for="(item,index) in state.formData" :key="index">
                <el-form-item :label="item.type_ + ':'">
                    <el-input style="width: 100%" v-model.trim="item.link" />
                </el-form-item>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { postHomeDeploy } from '@/api/website'
import { deepClone } from '@/common/util'

const emits = defineEmits(['getData', 'close'])
const props = defineProps({
    tableData: {
        type: Array,
        default: () => []
    },
    icon: {
        type: String,
        default: ''
    },
    unIcon: {
        type: String,
        default: ''
    }
})
const dialog = ref(null)
const state = reactive({
    formData: [],
    icon: '',
    unIcon: ''
})

onMounted(() => {
    state.formData = deepClone(props.tableData)
    state.icon = props.icon
    state.unIcon = props.unIcon
})

const handleSubmit = () => {
    let arr = deepClone(state.formData)
    arr.push({ link: state.unIcon, type: 4 })
    arr.push({ link: state.icon, type: 5 })
    let params = {
        part: 'homeFloatBall',
        alias: 'homeFloatBall',
        type: 'cs',
        status: 1,
        homeFloatBallConfig: JSON.stringify(arr.map(item => {
            if (item.link && item.link.indexOf('http') !== 0) {
                item.link = 'https://' + item.link
            }
            delete item.type_
            return item
        }))
    }
    dialog.value.showLoading()
    postHomeDeploy(params).then(() => {
        emits('close')
        emits('getData')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
.tips {
    color: red;
    line-height: 20px;
}
</style>

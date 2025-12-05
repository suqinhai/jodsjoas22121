<template>
    <!-- 品牌设置-关于我们 -->
    <div class="about_us">
        <el-form ref="aboutUsForm" :rules="state.rules" :model="state.formData" :disabled="state.isDisabled" label-width="140px">
            <!-- <el-form-item :label="$t('是否开启:')" required>
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" :active-text="$t('开启')"
                    :inactive-text="$t('关闭')" />
            </el-form-item> -->
            <el-form-item :label="$t('标题:')" prop="title">
                <el-input style="width: 800px" v-model="state.formData.title" :placeholder="$t('请输入标题')" />
            </el-form-item>
            <el-form-item :label="$t('内容:')" prop="content">
                <Tinymce :disabled="state.isDisabled" width="800px" v-model="state.formData.content">
                </Tinymce>
            </el-form-item>
        </el-form>
        <div class="btn">
            <el-button v-throttle v-if="!state.isDisabled" @click="handleBtn(1)">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleBtn(2,aboutUsForm)">{{$t('保 存')}}</el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { getGgreementList, postGgreementData } from '@/api/operation'

const state = reactive({
    formData: {
        status: 0,
        type: 1
    },
    rules: {
        title: [
            { required: true, message: $t('请输入标题！'), trigger: 'blur' },
        ],
        content: [
            { required: true, message: $t('请输入内容！'), trigger: 'blur' },
        ]
    },
    isDisabled: true
})
const aboutUsForm = ref(null)

onMounted(() => {
    getData()
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getGgreementList({ type: 1 }).then((res) => {
        if (res.data.id) {
            state.formData = res.data
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 操作按钮
const handleBtn = (type, el) => {
    if (type === 1) {
        getData()
    } else {
        el.validate(async (valid) => {
            if (valid) {
                globalVBus.$emit('globalLoading', true)
                postGgreementData(state.formData).then((res) => {
                    // ElMessage.success($t('修改成功！'));
                    getData()
                }).catch(() => {
                    globalVBus.$emit('globalLoading', false)
                })
            } else {
                ElMessage.warning($t('请完善表单内容在进行操作！'))
            }
        })
    }
}
</script>

<style lang="scss">
.about_us {
    height: calc(100% - 55px);
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;

    .btn {
        display: flex;
        justify-content: center;
        margin-left: 100px;
    }
}
</style>

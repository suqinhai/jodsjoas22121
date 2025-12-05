<template>
    <!-- 代理中心-代理设置-代理推广链接方式-->
    <div class="share-config">
        <div class="tips-box">{{ $t('说明：选择随机则系统随机，前端代理页面，每次刷新随机一个;') }}</div>
        <div class="share-form">
            <el-form class="form" ref="deployRef" :model="state.formData" :rules="state.rules" :disabled="state.isDisabled">
                <el-form-item :label="$t('代理推广链接方式') + ':'">
                    <el-radio-group v-model="state.formData.metaType">
                        <el-radio label="0">{{$t('固定')}}</el-radio>
                        <el-radio label="1">{{$t('随机')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>

        <div class="btn" v-permiss="'merchant.agent.linkMethod.edit'">
            <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.isDisabled" @click="handleSave(deployRef)">{{$t('保 存')}}
            </el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup name="ShareConfig">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMetaData, postMetaData } from '@/api/common'



const state = reactive({
    isDisabled: true,
    formData: {
        metaType: '0',
    },
    id: ''
})

const deployRef = ref(null)

onMounted(() => {
    getData()
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 61 }).then(({ data, status, ext }) => {
        if (status === 'OK' && data) {
            state.formData.metaType = data['代理推广链接方式'].value
            state.id = data['代理推广链接方式'].id
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const params = {
                value: state.formData.metaType,
                type: 61,
                name: 'link_method',
                label: $t('代理推广链接方式'),
                id: state.id || ''
            }
            globalVBus.$emit('globalLoading', true)
            postMetaData(params).then(() => {
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss" scoped>
.share-config {
    padding-left: 100px;
    .share-form {
        display: flex;
        .form {
            width: 400px;
            margin-right: 80px;
        }
    }
    .btn {
        margin-top: 20px;
    }
}
</style>

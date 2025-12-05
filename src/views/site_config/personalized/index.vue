<template>
    <!-- 站点配置-个性化配置 -->
    <div class="container personalized-config">
        <el-form ref="deployRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '200px' : 'auto'" label-position="top" :disabled="state.isDisabled">
            <div class="theme-container">
                <el-form-item :label="$t('游戏图标:')" prop="config.gameIconType">
                    <el-radio-group v-model="state.formData.config.gameIconType">
                        <label class="theme-item">
                            <el-radio :label="0">{{ $t('欧美版（长方形）') }}</el-radio>
                            <img src="@/assets/img/home/home_icon_rect.png" width="150" />
                        </label>
                        <label class="theme-item">
                            <el-radio :label="1">{{ $t('经典版（正方形）') }}</el-radio>
                            <img src="@/assets/img/home/home_icon_square.png" width="150" height="150" />
                        </label>
                    </el-radio-group>
                </el-form-item>
            </div>
            <div class="theme-container" style="margin-top: 40px;">
                <el-form-item :label="$t('翻页样式:')" prop="config.flipType">
                    <el-radio-group v-model="state.formData.config.flipType">
                        <label class="theme-item">
                            <el-radio :label="0">{{ $t('手动加载') }}</el-radio>
                            <img src="@/assets/img/home/home_more1.png" width="200" />
                        </label>
                        <label class="theme-item">
                            <el-radio :label="1">{{ $t('手动翻页') }}</el-radio>
                            <img src="@/assets/img/home/home_more2.png" width="200" />
                        </label>
                    </el-radio-group>
                </el-form-item>
            </div>
        </el-form>

        <div class="btn" v-permiss="'merchant.merchant.personalized.edit'">
            <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.isDisabled" @click="handleSave(deployRef)">{{$t('保 存')}}
            </el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup name="registerConfig">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMetaData, postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'

const state = reactive({
    formData: {
        config: {
            gameIconType: undefined,
            flipType: undefined,
        }
    },
    rules: {
        'config.gameIconType': [
            { required: true, message: $t('必选项不能为空！'), trigger: 'change' }
        ],
        'config.flipType': [
            { required: true, message: $t('必选项不能为空！'), trigger: 'change' }
        ]
    }
})

const deployRef = ref(null)

onMounted(() => {
    getData()
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 58 }).then(({ data, status, ext }) => {
        if (status === 'OK' && data && Object.values(data)[0]) {
            let obj = Object.values(data)[0]
            state.formData = Object.assign(state.formData, obj)
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
            const params = deepClone(state.formData)
            params.type = 58
            params.config = JSON.stringify(params.config)
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
.personalized-config {
    padding-left: 100px;
    
    .theme-container {
        ::v-deep(.el-radio-group) {
            align-items: flex-start;
        }
        .theme-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            &:first-child {
                margin-right: 40px;
            }
        }
    }
    .btn {
        width: 400px;
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
}
</style>

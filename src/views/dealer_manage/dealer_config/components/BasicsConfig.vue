<template>
    <!-- 经销商配置-经销商配置 -->
    <div class="dealer-basics-config">
        <el-form ref="deployForm" :disabled="state.isDisabled" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '150px' : 'auto'">
            <el-form-item :label="$t('前台联系设置:')" class="deploy-box">
                <div v-for="(item, index) in state.formData.contactList" :key="index" class="small-box">
                    <el-form-item :prop="'contactList.' + index + '.k'" :rules="[{ required: true, message: $t('请选择联系方式！'), trigger: 'change' }]" label-width="0">
                        <el-select style="width: 150px" v-model="item.k" :placeholder="$t('请选择联系方式')">
                            <el-option v-for="its in metaData.imType" :key="its.value" :label="its.label" :value="+its.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :prop="'contactList.' + index + '.v'" :rules="[{ required: true, message: $t('请输入联系信息！'), trigger: 'blur' }]" label-width="0">
                        <el-input style="width: 500px" v-model="item.v" :placeholder="$t('请输入联系信息')" />
                    </el-form-item>
                    <div class="operate">
                        <el-button v-throttle v-if="state.formData.contactList.length < 3" type="primary" @click="handleAdd(index)" :icon="Plus">
                        </el-button>
                        <el-button v-throttle v-if="state.formData.contactList.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item :label="$t('申请联系方式:')" prop="service">
                <el-checkbox-group v-model="state.formData.service">
                    <el-checkbox v-for="item in metaData.imType" :key="item.value" :label="+item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('广告内容配置:')">
                <Tinymce :disabled="state.isDisabled" v-model="state.formData.content" width="800px">
                </Tinymce>
            </el-form-item>
        </el-form>
        <div class="foot" v-permiss="'merchant.dealer.awardCfgEdit'">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Minus } from "@element-plus/icons-vue"
import { getDealerContactConfig, postDealerContactConfig } from '@/api/dealer'

const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
})
const deployForm = ref(null)
const state = reactive({
    isDisabled: true,
    formData: {
        contactList: [{ k: '', v: '' }],
        service: []
    },
    id: '',
    rules: {
        service: [{ required: true, message: $t('请设置申请联系方式！'), trigger: 'blur' }]
    }
})

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getDealerContactConfig({ type: 0 }).then(res => {
        let { data } = res
        if (data) {
            state.id = data.id
            let { info, content = '' } = data
            state.formData.contactList = info?.contact || [{ k: '', v: '' }]
            state.formData.service = info?.service || []
            state.formData.content = content
        } else {
            state.formData = {
                contactList: [{ k: '', v: '' }],
                service: []
            }
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 删除
const handleDel = (index) => {
    state.formData.contactList.splice(index, 1)
}

// 添加
const handleAdd = (index) => {
    state.formData.contactList.splice(index + 1, 0, {
        k: '',
        v: '',
    })
}

// 保存
const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { contactList, service, content } = state.formData
            contactList.forEach(item => {
                if (!!item.v.indexOf('http')) item.v = 'https://' + item.v
            })
            globalVBus.$emit('globalLoading', true)
            postDealerContactConfig({
                id: state.id,
                type: 0,
                content,
                info: JSON.stringify({ service, contact: contactList })
            }).then(() => {
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善配置内容再进行提交！'))
        }
    })
}

</script>

<style lang="scss">
.dealer-basics-config {
    .deploy-box {
        .small-box {
            width: 100%;
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .operate {
            margin-left: 10px;
        }
    }
}
</style>
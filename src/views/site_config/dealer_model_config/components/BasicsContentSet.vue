<template>
    <!-- 经销商模式配置-常规内容编辑 -->
    <div class="tabs-main dealer-basics-content">
        <el-form ref="deployForm" :disabled="state.isDisabled" :model="state.formData" :rules="state.rules" label-width="auto">
            <el-form-item :label="$t('设置名称:')" prop="name">
                <el-input v-model="state.formData.name" style="width: 850px;" type="textarea" rows="4" :placeholder="$t('请设置名称')" maxlength="100"
                    show-word-limit />
            </el-form-item>
            <!-- <el-form-item :label="$t('经销商联系方式:')" prop="contactUrl">
                <el-select v-model="state.formData.type" placeholder="请选择联系方式">
                    <el-option v-for="item in state.imType" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
                <el-input v-model="state.formData.contactUrl" style="width: 654px;" :placeholder="$t('请输入联系信息')" />
            </el-form-item> -->
            <el-form-item :label="$t('经销商联系方式:')" class="deploy-box">
                <div v-for="(item, index) in state.formData.contactList" :key="index" class="small-box">
                    <el-form-item :prop="'contactList.' + index + '.k'" :rules="[{ required: true, message: $t('请选择联系方式！'), trigger: 'change' }]"
                        label-width="0">
                        <el-select style="width: 130px" v-model="item.k" :placeholder="$t('请选择联系方式')">
                            <el-option v-for="its in state.imType" :key="its.value" :label="its.label" :value="+its.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :prop="'contactList.' + index + '.v'" :rules="[{ required: true, message: $t('请输入联系信息！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input style="width: 604px;" v-model="item.v" :placeholder="$t('请输入联系信息')" />
                    </el-form-item>
                    <div class="operate">
                        <el-button v-throttle v-if="state.formData.contactList.length < 3" type="primary" @click="handleAdd(index)" :icon="Plus">
                        </el-button>
                        <el-button v-throttle v-if="state.formData.contactList.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item :label="$t('申请说明:')">
                <Tinymce v-model="state.formData.content" :disabled="state.isDisabled" width="850px">
                </Tinymce>
            </el-form-item>
            <el-form-item :label="$t('转发内容编辑:')">
                <el-input v-model="state.formData.shareContent" style="width: 850px;" type="textarea" rows="4" :placeholder="$t('请输入转发内容')"
                    maxlength="100" show-word-limit />
                <div class="dealer-tips">{{$t('注：分享推广链接时显示的分享内容。')}}</div>
            </el-form-item>
            <el-form-item :label="$t('会员申请联系方式:')" prop="service">
                <el-checkbox-group v-model="state.formData.service">
                    <el-checkbox v-for="item in state.imType" :key="item.value" :label="+item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
                <div class="dealer-tips">{{$t('注：会员申请时可填写的类型联系方式。')}}</div>
            </el-form-item>
        </el-form>
        <div class="foot" v-permiss="'merchant.app.layout-cs'">
            <el-button v-throttle type="primary" @click="state.showPreview = true">{{$t('前端预览')}}</el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>

        <PreviewDialog v-if="state.showPreview" :itemData="state.formData" :imType="state.imType" @close="state.showPreview = false">
        </PreviewDialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Minus } from "@element-plus/icons-vue"
import userStore from '@/store/user'
import { getDealerContactConfig, postDealerContactConfig } from '@/api/dealer'
import { getCommonMeta } from '@/api/common'
const PreviewDialog = defineAsyncComponent(() => import('./PreviewDialog.vue'))

const state = reactive({
    showPreview: false,
    isDisabled: true,
    id: '',
    formData: {
        contactList: [{ k: 1, v: '' }],
        service: []
    },
    rules: {
        name: { required: true, message: $t('请设置名称！'), trigger: 'blur' },
        service: { required: true, message: $t('请选择会员申请联系方式！'), trigger: 'blur' }
    },
    imType: []
})
const deployForm = ref(null)
const userData = userStore()

onMounted(() => {
    globalVBus.$emit('globalLoading', true)
    getCommonMeta({ types: 'imType' }).then(({ data, code }) => {
        if (code === 0 && data && data.imType) {
            state.imType = data.imType || []
        }
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })

})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getDealerContactConfig({ type: 0 }).then(res => {
        let { data } = res
        if (data) {
            state.id = data.id
            let { info, content = '', name, shareContent } = data
            state.formData = {
                content,
                name,
                shareContent,
                contactList: info?.contact || [{ k: 1, v: '' }],
                service: info?.service || []
            }
        } else {
            state.formData = {
                contactList: [{ k: 1, v: '' }],
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
        k: 1,
        v: '',
    })
}

// 保存
const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { contactList, service, content, name, shareContent } = state.formData
            let params = {
                id: state.id,
                type: 0,
                content,
                name,
                shareContent,
            }
            contactList.forEach(item => {
                if (!!item.v.indexOf('http')) item.v = 'https://' + item.v
            })
            params.info = JSON.stringify({ service, contact: contactList })
            globalVBus.$emit('globalLoading', true)
            postDealerContactConfig(params).then(() => {
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
.dealer-basics-content {
    overflow-y: auto;
    margin-left: 50px;
    .dealer-tips {
        width: 100%;
    }
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
    .foot {
        margin-top: 50px;
        width: 600px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 30px;
    }
}
</style>
<template>
    <!-- 代理中心-代理设置-网站分享内容设置-->
    <div class="share-config">
        <div class="tips-box">{{ $t('说明：请复制生成的链接，通过telegram，WhatsApp内发送消息链接时，将会显示配置的内容') }}</div>
        <div class="share-form">
            <el-form class="form" ref="deployRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '200px' : 'auto'" label-position="top" :disabled="state.isDisabled">
                <el-form-item :label="$t('域名:')" prop="domain">
                    <el-select v-model="state.formData.domain" :placeholder="$t('请选择域名')" @change="handleChange">
                        <el-option v-for="item in state.domainList" :key="item.id" :label="item.name" :value="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('网站描述:')" prop="description">
                    <el-input v-model="state.formData.description" type="textarea" :rows="4" :maxlength="200" show-word-limit :placeholder="$t('请输入网站描述')" />
                </el-form-item>
                <el-form-item :label="$t('内容图片:')" prop="image">
                    <UploadImage 
                    :width="430" 
                    :height="230"
                    :size="30"
                    v-model="state.formData.image"
                    :accept="'.png,.jpg,.jpeg'"
                    :tip="`${$t('规格：430*230PNG/JPG格式图片，30KB以内')}`">
                    </UploadImage>
                </el-form-item>
                <el-form-item prop="shareURL" v-if="state.formData.shareURL">
                    <label style="color: #606266;margin-right: 8px;">{{ $t('生成链接:') }}</label>
                    <span>{{ state.formData.shareURL }}</span>
                </el-form-item>
            </el-form>
            <!-- <div class="preview-link">
                <img src="@/assets/img/agent/link_preview.png">
            </div> -->
        </div>

        <div class="btn" v-permiss="'merchant.agent.shareContent.edit'">
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
import { getDomainList } from '@/api/app_and_domain_manage'
import { deepClone } from '@/common/util'


const state = reactive({
    domainList: [],
    allConfig: {},
    formData: {},
    rules: {
        'domain': [
            { required: true, message: $t('必选项不能为空！'), trigger: 'change' }
        ],
        'description': [
            { required: true, message: $t('必填项不能为空！'), trigger: 'change' }
        ],
        'image': [
            { required: true, message: $t('必填项不能为空！'), trigger: 'change' }
        ]
    }
})

const deployRef = ref(null)

onMounted(() => {
    getData()
    fetchData()
})

// 获取域名列表
const fetchData = () => {
    let params = { 
        forBack: 0,
        _page: 1,
        _size: 99999
    }
    getDomainList(params).then(res => {
        const { list } = res.data
        state.domainList = list.filter(item => item.active === 1)
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.domainList = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 57 }).then(({ data, status, ext }) => {
        if (status === 'OK' && data && Object.values(data)[0]) {
            let obj = Object.values(data)[0]
            state.allConfig = deepClone(obj)
            if (state.allConfig.config?.length) {
                const index = state.allConfig.config.findIndex((item)=>{
                    return item.domain === state.formData.domain
                })
                const cfg = state.allConfig.config[index == -1 ? 0 : index]
                state.formData = Object.assign(state.formData, cfg)
            }
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleChange = (val) => {
    const item = state.allConfig.config?.find(item => item.domain === val) || { domain: val }
    state.formData = deepClone(item)
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const params = deepClone(state.allConfig)
            params.type = 57
            const config = deepClone(state.formData)
            if (params.config?.length) {
                params.config = params.config.filter(item => item.domain !== config.domain)
                params.config.push(config)
            } else { 
                params.config = [deepClone(config)]
            }
            params.config = JSON.stringify(params.config)
            globalVBus.$emit('globalLoading', true)
            postMetaData(params).then(() => {
                // globalVBus.$emit('globalLoading', false)
                // state.isDisabled = true
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

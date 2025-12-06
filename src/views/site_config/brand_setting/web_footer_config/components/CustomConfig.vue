<template>
    <!-- 品牌设置-Web页脚配置-C版配置 -->
    <div class="footer-custom-config">
        <el-form :model="state.formData" :disabled="state.isDisabled" label-width="auto">
            <el-form-item class="items-box" :label="$t('博彩牌照:')">
                <el-switch v-model="state.formData.license" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                <el-radio-group v-model="state.formData.licenseType">
                    <el-radio :label="1" :value="1">{{$t('矩形规格')}}</el-radio>
                    <el-radio :label="2" :value="2">{{$t('方形规格')}}</el-radio>
                </el-radio-group>
                <el-form-item label-width="0px">
                    <UploadImage v-model="state.formData.licenseImg" accept=".png,.jpg,.jpeg" :width="state.formData.licenseType === 1 ? 215 : 60"
                        :height="state.formData.licenseType === 1 ? 79 : 60" :size="200" :disabled="state.isDisabled"
                        :tip="`${$t('上传')}${state.formData.licenseType === 1 ? 215 : 60}*${state.formData.licenseType === 1 ? 79 : 60}${$t('或等比例，PNG/JPG格式小于')}200${$t('KB的图片')}`" />
                </el-form-item>
                <el-form-item label-width="auto" :label="$t('说明:')">
                    <el-input style="width: 480px" type="textarea" :rows="4" show-word-limit :maxlength="100" :placeholder="$t('请输入说明')"
                        v-model="state.formData.licenseDesc" />
                </el-form-item>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('负责任博彩:')">
                <el-switch v-model="state.formData.promise" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                <div class="items-box-img">
                    <el-image :crossorigin="null" :src="'/img/default/footer_promise1.png'" :preview-src-list="['/img/default/footer_promise1.png']"
                        preview-teleported fit="contain" />
                    <el-image :crossorigin="null" :src="'/img/default/footer_promise2.png'" :preview-src-list="['/img/default/footer_promise2.png']"
                        preview-teleported fit="contain" />
                </div>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('厂家配置:')">
                <el-switch v-model="state.formData.vender" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                <el-form-item label-width="0px">
                    <UploadImage v-model="state.formData.venderImg" :width="527" :size="200" accept=".png,.jpg,.jpeg" :disabled="state.isDisabled"
                        :tip="`${$t('上传')}${$t('宽度为527（不限制高度），PNG/JPG格式小于')}200${$t('KB的图片')}`" />

                </el-form-item>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('帮助说明:')">
                <el-switch v-model="state.formData.helpDesc" :active-value="1" :inactive-value="0" :active-text="$t('开启')"
                    :inactive-text="$t('关闭')" />
                <div class="items-box-tips">{{$t('开启后-关联常见问题显示，关闭则帮助说明入口不显示')}}</div>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('付款方式:')">
                <el-switch v-model="state.formData.payWay" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                <el-form-item label-width="0px">
                    <UploadImage v-model="state.formData.payWayImg" :width="53" :height="53" :size="10" accept=".png,.jpg,.jpeg" :limit="99"
                        :disabled="state.isDisabled" :tip="`${$t('上传')}53*53${$t('或等比例，PNG/JPG格式小于')}10${$t('KB的图片')}`" />
                </el-form-item>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('安全:')">
                <el-switch v-model="state.formData.safety" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                <div class="items-box-img">
                    <el-image :crossorigin="null" :src="'/img/default/footer_safety.png'" :preview-src-list="['/img/default/footer_safety.png']"
                        preview-teleported fit="contain" />
                </div>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('牌照确认:')">
                <el-switch v-model="state.formData.certification" :active-value="1" :inactive-value="0" :active-text="$t('开启')"
                    :inactive-text="$t('关闭')" />
                <div class="items-box-img">
                    <el-image :crossorigin="null" :src="'/img/default/footer_certification.png'"
                        :preview-src-list="['/img/default/footer_certification.png']" preview-teleported fit="contain" />
                </div>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('加入我们:')">
                <el-switch v-model="state.formData.joinUs" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                <div class="items-box-tips">{{$t('说明：该处获取客服配置，显示已配置的客服类型图标，无则不显示。')}}</div>
            </el-form-item>

            <el-form-item class="items-box" :label="$t('版权信息:')">
                <div>
                    <el-switch v-model="state.formData.copyright" :active-value="1" :inactive-value="0" :active-text="$t('开启')"
                        :inactive-text="$t('关闭')" />
                </div>
                <el-input style="width: 480px" type="textarea" :rows="4" show-word-limit :maxlength="100" :placeholder="$t('请输入版权信息')"
                    v-model="state.formData.copyrightDesc" />
            </el-form-item>
        </el-form>
        <div class="btn">
            <el-button v-throttle size="large" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:30px" type="primary" size="large" v-if="!state.isDisabled" @click="handleSave">
                {{$t('保 存')}}</el-button>
            <el-button v-throttle type="primary" size="large" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineProps } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'

const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {
        license: 0,
        licenseType: 1,
        promise: 0,
        vender: 0,
        helpDesc: 0,
        payWay: 0,
        safety: 0,
        certification: 0,
        joinUs: 0,
        copyright: 0,
    },
    isDisabled: false,
})

onMounted(() => {
    getData()
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'webFooter' }).then(({ data, code }) => {
        if (code === 0 && data) {
            if (data && data.customFooter) {
                state.formData = Object.assign(state.formData, JSON.parse(data.customFooter))
            }
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 保存
const handleSave = () => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({ footerConfig: JSON.stringify({ customFooter: state.formData }), part: 'webFooter' }).then((res) => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.footer-custom-config {
    height: calc(100% - 55px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;

    .items-box {
        margin-left: 50px;
        > .el-form-item__content {
            flex-direction: column;
            align-items: flex-start;
            .el-form-item {
                margin-bottom: 10px !important;
                .el-form-item__label-wrap {
                    margin-left: 0 !important;
                }
            }
        }
        &-img {
            margin-top: 10px;
            width: fit-content;
            background: #0b1228;
            height: 60px;
            .el-image {
                height: 40px;
                margin: 10px;
                & + .el-image {
                    margin-left: 10px;
                }
            }
        }
    }

    .btn {
        margin-left: 250px;
        padding: 20px 0;
    }
}
</style>

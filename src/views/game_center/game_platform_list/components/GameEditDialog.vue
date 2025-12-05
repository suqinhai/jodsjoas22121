<template>
    <!-- 游戏平台列表-修改/批量修改 -->
    <Dialog :title="currentItem.ids ? $t('批量修改'): $t('修改')" ref="dialog" :buttonCenter="!!currentItem.ids" @confirm="confirmEdit(deployFormRef)"
        @cancel="emits('close')" :width="!!currentItem.ids ? 400 : 650">
        <div class="tips" v-if="isCopyGame">Tips:{{$t('请在PG中修改图标')}}</div>
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" label-width="auto">
            <el-form-item :label="$t('最低准入:')" prop="minEntry">
                <el-input-number v-model="state.formData.minEntry" :controls="false" :precision="0" :min="1" :placeholder="$t('请输入最低准入额')" />
            </el-form-item>
            <el-form-item :label="$t('排序:')" prop="sort" v-if="currentItem.id">
                <el-input-number v-model="state.formData.sort" :controls="false" :precision="0" :min="1" :placeholder="$t('请输入排序')" />
            </el-form-item>
            <template v-if="!isCopyGame &&  userData.getTemplateType() === 1 && currentItem.id">
                <el-form-item :label="$t('宣传图(欧美):')" prop="VSloganImage">
                    <UploadImage :width="LIMIT_US.VENDOR_IMG_WIDTH" :height="LIMIT_US.VENDOR_IMG_HEIGHT" bizType="game" :gameParams="getGameParams()"
                        v-model="state.formData.VSloganImage"
                        :tip="`${$t('请上传')}${LIMIT_US.VENDOR_IMG_WIDTH}*${LIMIT_US.VENDOR_IMG_HEIGHT}${$t('或等比例，PNG/JPG格式小于100KB的图片')}`">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('热门图片(欧美):')" prop="VHotImages" v-if="!isCopyGame && userData.getTemplateType() === 1 && currentItem.id">
                    <UploadImage :width="LIMIT_US.VENDOR_IMG_WIDTH" :height="LIMIT_US.VENDOR_IMG_HEIGHT" bizType="game" :gameParams="getGameParams(1)"
                        v-model="state.formData.VHotImages"
                        :tip="`${$t('请上传')}${LIMIT_US.VENDOR_IMG_WIDTH}*${LIMIT_US.VENDOR_IMG_HEIGHT}${$t('或等比例，PNG/JPG格式小于100KB的图片')}`">
                    </UploadImage>
                </el-form-item>
            </template>
            <template v-if="!isCopyGame &&  userData.getTemplateType() === 2 && currentItem.id">
                <el-form-item :label="$t('宣传图(亚太):')" prop="FSloganImage">
                    <UploadImage :width="LIMIT_AS.VENDOR_IMG_SQUARE_WIDTH" :height="LIMIT_AS.VENDOR_IMG_SQUARE_HEIGHT" bizType="game"
                        :gameParams="getGameParams()" v-model="state.formData.FSloganImage"
                        :tip="`${$t('请上传')}${LIMIT_AS.VENDOR_IMG_SQUARE_WIDTH}*${LIMIT_AS.VENDOR_IMG_SQUARE_HEIGHT}${$t('或等比例，PNG/JPG格式小于300KB的图片')}`">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('热门图片(亚太):')" prop="FHotImages">
                    <UploadImage v-model="state.formData.FHotImages" :size="100" :width="LIMIT_AS.HOT_IMG_WIDTH" bizType="game"
                        :height="LIMIT_AS.HOT_IMG_HEIGHT" :gameParams="getGameParams(1)"
                        :tip="`${$t('请上传')}${LIMIT_AS.HOT_IMG_WIDTH}*${LIMIT_AS.HOT_IMG_HEIGHT}${$t('或等比例，PNG/JPG格式小于100KB的图片')}`">
                    </UploadImage>
                </el-form-item>
            </template>
            <template v-if="!isCopyGame &&  userData.getTemplateType() === 4 && currentItem.id">
                <el-form-item :label="$t('定制版LOGO(已选择)') + ':'">
                    <UploadImage disabled v-model="state.formData.activeLogo" :width="200" :height="100" :size="100" bizType="game"
                        :gameParams="getGameParams(3)" :tip="`${$t('请上传')}200*100${$t('或等比例，PNG/JPG格式小于100KB的图片')}`">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('定制版LOGO(未选择)') + ':'" style="margin-bottom: 0">
                    <UploadImage disabled v-model="state.formData.nonActiveLogo" :width="200" :height="100" :size="100" bizType="game"
                        :gameParams="getGameParams(3)" :tip="`${$t('请上传')}200*100${$t('或等比例，PNG/JPG格式小于100KB的图片')}`">
                    </UploadImage>
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { LIMIT_US, LIMIT_AS } from '@/common/util/appConfig.js'
import { editVendor, batchPostVendorData } from '@/api/merchant_center.js'

const prop = defineProps(['currentItem'])
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    formData: {},
    rules: {
        minEntry: { required: true, message: $t('请输入最低准入额！'), trigger: 'blur' },
        sort: { required: true, message: $t('请输入排序！'), trigger: 'blur' },
        // image: { required: true, message: $t('请上传品牌LOGO！'), trigger: 'change' }
    },
})
const dialog = ref(null)
const userData = userStore()
const deployFormRef = ref(null)

const isCopyGame = computed(() => {
    return prop.currentItem.alias === 'PGC' || prop.currentItem.alias === 'BPG'
})

const gameParams = computed(() => {
    return {
        style: userData.getTemplateType(),
        vendor: prop.currentItem.alias,
        gameType: prop.currentItem.type
    }
})

onMounted(() => {
    state.formData = { ...prop.currentItem }
})

const getGameParams = (isHot) => {
    let params = {
        style: userData.getTemplateType() === 4 ? 3 : userData.getTemplateType(),
        vendor: state.formData.alias,
        gameType: state.formData.type
    }
    if (isHot) {
        params.gameId = 'HOT'
    }
    return params
}

const confirmEdit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const { minEntry, VSloganImage, FSloganImage, sort, VHotImages, FHotImages, activeLogo = '', nonActiveLogo = '', ids, id } = state.formData
            let params = {
                minEntry,
                sloganImages: [VSloganImage, FSloganImage].join(','),
                sort,
                hotImages: [VHotImages, FHotImages].join(','),
                id
            }
            if (userData.getTemplateType() === 4 && !isCopyGame.value) params.customizedImages = [activeLogo, nonActiveLogo].join(',')
            let api = editVendor
            if (ids) {
                params = { minEntry, ids, items: 'minEntry' }
                api = batchPostVendorData
            }
            dialog.value.showLoading()
            api(params).then(() => {
                emits('close')
                emits('refresh')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang='scss' scoped>
.tips {
    text-align: center;
    color: red;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 14px;
}
</style>
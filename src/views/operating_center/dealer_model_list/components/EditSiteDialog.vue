<template>
    <!-- 经销商模式列表-修改站点 -->
    <Dialog ref="dialog" width="850" :title="itemData.name" top="10vh" @confirm="handleSubmit" @cancel="cancel">
        <el-form ref="deployForm" label-width="auto">
            <el-form-item :label="$t('使用站点:')">
                <el-checkbox v-model="state.checkAll" :indeterminate="state.isIndeterminate" @change="handleAll">{{$t('全部站点')}}</el-checkbox>
                <el-checkbox-group v-model="state.siteId" @change="handleCheck">
                    <el-checkbox v-for="item in dealerSite" :key="item.id" :label="item.id">{{ item.name +`（ID：${item.id}）` }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import commonStore from '@/store/common'
import { postDealerModelSiteData } from '@/api/dealer'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    siteId: [],
    checkAll: false,
    isIndeterminate: false,
})
const dialog = ref(null)
const commonData = commonStore()

const dealerSite = computed(() => {
    return commonData.merchantSiteList.filter(item => item.enableDealer)
})

onMounted(() => {
    state.siteId = props.itemData.siteId || []
    if (state.siteId.length) {
        state.siteId = state.siteId.filter(item => dealerSite.value.some(its => item === its.id))
    }
    const checkedCount = state.siteId.length
    state.checkAll = checkedCount === dealerSite.value.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < dealerSite.value.length
})

const handleAll = (val) => {
    state.siteId = val
        ? dealerSite.value.map((item) => item.id)
        : []
    state.isIndeterminate = false
}

const handleCheck = () => {
    const checkedCount = state.siteId.length
    state.checkAll = checkedCount === dealerSite.value.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < dealerSite.value.length
}

const handleSubmit = () => {
    dialog.value.showLoading()
    postDealerModelSiteData({
        id: props.itemData.id,
        siteId: state.siteId.join(',')
    }).then(() => {
        cancel()
        emits('fetchData')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss" scoped>
</style>

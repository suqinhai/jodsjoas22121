<!--
 * @Author: yilaisai
 * @Date: 2025-01-08 17:03:51
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-01-10 10:42:37
-->
<template>
    <Dialog ref="dialog" width="600" title="可操作站点数" top="10vh" :isShowBottomButton="false" @cancel="cancel">
        <el-table class="table-box" :data="state.formData" border>
            <el-table-column prop="id" :label="$t('站点ID')" min-width="140" align="center" />
            <el-table-column prop="name" :label="$t('站点名称')" min-width="140" align="center" />
        </el-table>
    </Dialog>
</template>

<script setup>
    import { ref, reactive, onMounted, watch } from 'vue'
    import commonStore from '@/store/common'
    const props = defineProps(['siteList'])
    const emits = defineEmits(['close'])
    const commonData = commonStore()
    const list = ref([])
    const state = reactive({
        formData:[]
    })

    watch(()=>commonData.allMerchantSiteList, (newVal)=>{
        if (!newVal.length) return []
        if (props.siteList[0] === 0) {
            state.formData = newVal
        } else {
            state.formData = newVal.filter(item => props.siteList.includes(item.id))
        }
       
    }, {
        immediate:true
    })
    onMounted( ()=> {
        commonData.getAllMerchantSiteData()
    })

    const cancel = () => {
        emits('close')
    }
</script>

<style lang="scss">

</style>
<!--
 * @Author: yilaisai
 * @Date: 2024-11-18 10:01:42
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-11-20 18:21:18
-->
<template>
    <!-- 充值通道列表 -->
    <div class="container recharge-channel-list-page">
        <el-table class="table-box" ref="tableRef" :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('站点名称')" min-width="140" align="center" />
            <el-table-column :label="item.channel_ + $t('金额/成功率')" min-width="120" align="center" v-for="item in state.channelList">
                <template #default="{ row }">
                    <span>{{row.detail[item.channel_]?row.detail[item.channel_].successAmount+'/' + row.detail[item.channel_].successRate + '%':'--' }}</span>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { getMerchantPayConfigList, getChannelStat } from '@/api/finance'
    const state = reactive({
        channelList:[],
        tableData:[],
        total: 0,
        listQuery: {
            _page: 1,
            _size: 10,
        },
    })

    const getChannelList = async ()=> {
        await getMerchantPayConfigList().then(res => {
            state.channelList = res.data.filter(item => !!item.enabled)
        })
    }

    const fetchData = (val = '')=> {
        if (val && val !== 'export') {
            state.listQuery._page = 1
            if (val === 'reset') {
                state.formData = {}
            }
        }
        let params = { ...state.listQuery}
        globalVBus.$emit('globalLoading', true)
        getChannelStat(params).then(res => {
            state.tableData = []
            let { total, list = [] } = res.data
            state.tableData = list
            state.total = total
            globalVBus.$emit('globalLoading', false)
        }).catch(err => {
            state.tableData = []
            globalVBus.$emit('globalLoading', false)
        })
    }
    onMounted(async ()=>{
        await getChannelList()
        await fetchData()
    })
</script>

<style lang="scss">
    .recharge-channel-list-page {
        
    }
</style>
<template>
    <!-- 支付数据报表-详情- -->
    <Dialog ref="dialog" width="900" :title="$t('详情')" :isShowSubmit="false" top="10vh" @cancel="cancel">
        <el-form class="order-detail" :model="orderData" :label-width="$locale == 'zh' ? '130px' : 'auto'">
            <el-row>
                <el-col :span="8">
                    <el-form-item :label="$t('支付通道:')">
                       <span>{{props.itemData.channel_}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item :label="$t('日期') + ':'">
                        <span>{{props.itemData.receiveTime[0]}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
			<el-table :data="state.tableData" class="table-box" border>
			    <el-table-column v-for="(item,key) in state.keyData" :key="item" :label="item + $t('金额/成功率') + '%'" align="center">
					<template #default="{ row }">
					  {{ (row[item]?.amount || 0) + '/' + (row[item]?.rate || 0) }}
			        </template>
			    </el-table-column>
			</el-table>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getChannelCodeStat } from '@/api/statistics'
const emits = defineEmits(['close'])
const dialog = ref()
const state = reactive({
	keyData: {},
	tableData:[]
})
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})

onMounted(()=>{
	fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    let params = { ...props.itemData }
    let { receiveTime } = params
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    dialog.value.showLoading()
    getChannelCodeStat(params).then(({ data = {}, ext = [] }) => {
		state.tableData = [data] || {}
		state.keyData = ext
        dialog.value.closeLoading()
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.order-detail {
    .order-table {
        width: 100%;
        border: 1px solid #ddd;

        .table-col {
            display: flex;

            .small-box {
                flex: 3;
                text-align: center;
                line-height: 40px;
            }
        }

        .table-col + .table-col {
            border-top: 1px solid #ddd;
        }

        .small-box + .small-box {
            border-left: 1px solid #ddd;
        }
    }
}
</style>

<template>
    <!-- 站点配置-支付通道配置-领奖轮播设置 -->
    <Dialog ref="dialog" width="600" :title="$t('领奖轮播设置')" buttonCenter top="10vh" @cancel="emits('close')" @confirm="handleSubmit">
        <el-form class="ticket-carousel-config" label-width="auto">
            <el-form-item :label="$t('机器人轮播:')">
                <el-switch v-model="state.formData.open" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
            </el-form-item>
            <el-form-item :label="$t('触发人数:')">
                {{$t('真实人数少于')}}
                <el-input-number style="margin: 0 3px" v-model="state.formData.realNum" :controls="false" :precision="0" :min="1"
                    :placeholder="$t('请输入人数')" />{{$t('人时触发')}}
            </el-form-item>
            <div>{{$t('随机机器人账号(注：机器人根据当前票券最高中奖额度轮播)')}}</div>
            <div class="robot-config">
                <el-table style="width: 400px" :data="state.tableData" border>
                    <el-table-column :label="$t('会员账号')" align="center">
                        <template #default="{ row }">
                            <el-input style="width: 100%" @input="(val) => row.label = val.replace(/[\u4E00-\u9FFF]/g,'')" v-model="row.label"
                                :maxlength="20" show-word-limit :placeholder="$t('输入会员账号')" />
                        </template>
                    </el-table-column>
                </el-table>
                <div class="operate-box">
                    <el-button v-throttle v-if="state.tableData.length > 0" type="danger" @click="handleDel" :icon="Minus">
                    </el-button>
                    <el-button v-throttle type="primary" @click="handleAdd" :icon="Plus"></el-button>
                </div>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
// import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus } from "@element-plus/icons-vue"
import { postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'

const emits = defineEmits(['close', 'getData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {},
    tableData: [],
})
const dialog = ref(null)

onMounted(() => {
    if (props.itemData.value) {
        let { robots = [], open = false, realNum = 0 } = JSON.parse(props.itemData.value)
        state.formData = { open, realNum }
        state.tableData = robots.map(item => {
            return {
                label: item
            }
        })
    }
})

const handleAdd = () => {
    state.tableData.push({ label: '' })
}

const handleDel = () => {
    state.tableData.pop()
}

const handleSubmit = () => {
    // let arr = state.tableData.filter(item => item.label)
    // if (!arr.length ) return ElMessage.warning($t('请至少配置一种支付方式再进行提交！'))
    dialog.value.showLoading()
    let params = deepClone(props.itemData)
    params.type = 51
    params.config = JSON.stringify({
        ...state.formData,
        robots: state.tableData.filter(item => item.label).map(item => item.label)
    })
    postMetaData(params).then(res => {
        emits('close')
        emits('getData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss">
.ticket-carousel-config {
    .robot-config {
        display: flex;
        align-items: flex-end;

        .operate-box {
            margin-left: 15px;
        }
    }
}
</style>

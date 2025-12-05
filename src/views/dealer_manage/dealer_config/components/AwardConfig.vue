<template>
    <!-- 经销商配置-比例自动配置 -->
    <div class="dealer-award-config">
        <el-form ref="deployForm" :disabled="state.isDisabled" :model="formData" :rules="state.rules" :label-width="$locale == 'zh' ? '250px' : 'auto'">
            <div class="tips">{{$t('对不可编辑的代理，走系统自动化设置（不包括第一级）')}}</div>
            <el-form-item :label="$t('级别:')">
                <el-select style="width: 150px" v-model="state.level" :placeholder="$t('请选择级别')">
                    <el-option v-for="(item,index) in levelList" :key="index" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('下级分配首充奖励/人:')" prop="rate">
                <el-input-number v-model="formData.rate " :min="0" :precision="2" :controls="false" :placeholder="$t('奖励金额')" />
            </el-form-item>
            <el-form-item :label="$t('下级分配首充额外奖励/人:')" prop="extRate">
                <el-input-number v-model="formData.extRate " :min="0" :precision="2" :controls="false" :placeholder="$t('奖励金额')" />
            </el-form-item>
            <el-form-item :label="$t('奖励配置:')">
                <div style="width: 100%">
                    <el-table :data="formData.products" border style="width:400px">
                        <el-table-column :label="$t('人数')" prop="num" min-width="100" align="center" />
                        <el-table-column :label="$t('额外奖励')" min-width="140" align="center">
                            <template #default="{ row,$index }">
                                <el-form-item :prop="'products.' + $index + '.award'"
                                    :rules="[{ required: true, message: '', trigger: 'blur' }]" label-width="0">
                                    <el-input-number style="width: 100%" v-model="row.award" :min="0" :precision="2"
                                        :controls="false" :placeholder="$t('额外奖励')" />
                                </el-form-item>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div>{{$t('注：不可小于上一个级别的配置')}}</div>
            </el-form-item>
        </el-form>
        <div class="foot" v-permiss="'merchant.dealer.defaultRewardEdit'">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getDealerAwardConfig, postDealerAwardConfig } from '@/api/dealer'
import { deepClone } from '@/common/util'

const levelList = [
    { value: 0, label: $t('员工') },
    { value: 1, label: $t('管理') },
    { value: 2, label: $t('1级') },
    { value: 3, label: $t('2级') },
    { value: 4, label: $t('3级') },
]
const deployForm = ref(null)
const state = reactive({
    isDisabled: true,
    level: 0,
    initData: [],
    rules: {
        rate: [{ required: true, message: $t('请输入下级分配首充奖励！'), trigger: 'blur' }],
        extRate: [{ required: true, message: $t('请输入下级分配首充额外奖励！'), trigger: 'blur' }],
    }
})

const formData = computed(() => {
    return state.initData.length && state.initData[state.level] ? deepClone(state.initData[state.level]) : { products: [] }
})

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getDealerAwardConfig().then(res => {
        let { data } = res
        state.initData = data || []
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 保存
const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            globalVBus.$emit('globalLoading', true)
            postDealerAwardConfig(formData.value).then(() => {
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
.dealer-award-config {
    .tips {
        display: block;
        margin: 0 0 20px 20px;
    }
}
</style>
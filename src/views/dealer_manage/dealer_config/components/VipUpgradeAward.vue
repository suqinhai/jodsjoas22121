<template>
    <!-- 经销商配置-VIP晋级奖励配置 -->
    <div class="vip-upgrade-award">
        <div class="head" v-permiss="'merchant.dealer.defaultRewardEdit'">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
        <el-form ref="deployForm" :disabled="state.isDisabled" :model="state.formData">
            <el-table :data="state.formData" border style="width:400px">
                <el-table-column :label="$t('VIP等级')" prop="level" min-width="100" align="center" />
                <el-table-column :label="$t('额外奖励')" min-width="140" align="center">
                    <template #default="{ row,$index }">
                        <el-form-item :prop="$index + '.award'" :rules="[{ required: true, message: '', trigger: 'blur' }]" label-width="0">
                            <el-input-number style="width: 100%" v-model="row.award" :min="0" :precision="2" :controls="false" :placeholder="$t('额外奖励')" />
                        </el-form-item>
                    </template>
                </el-table-column>
            </el-table>
            <div>{{$t('注：经销商的直属会员晋级VIP时，可直接获得系统奖励')}}</div>
        </el-form>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDealerUpgradeAwardConfig, postDealerUpgradeAwardConfig } from '@/api/dealer'
import { getUserGradeData } from '@/api/common'

const state = reactive({
    isDisabled: true,
    formData: [],
    userLevel: []
})
const deployForm = ref(null)

onMounted(() => {
    getUserGradeData().then(({ data }) => {
        if (data) {
            for (let key in data) {
                state.userLevel.push({
                    label: data[key],
                    value: key,
                })
            }
            getData()
        }
    })
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getDealerUpgradeAwardConfig().then(res => {
        let { data } = res
        if (data && data.value) {
            state.formData = JSON.parse(data.value)
        } else if (state.userLevel.length) {
            state.userLevel.forEach(item => {
                if (!!+item.value) {
                    state.formData.push({
                        level: +item.value,
                        award: undefined
                    })
                }
            })
        }
        state.formData = state.formData.filter(item => state.userLevel.some(its => +its.value === +item.level))
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
            postDealerUpgradeAwardConfig({ config: JSON.stringify(state.formData) }).then(() => {
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
.vip-upgrade-award {
    padding-left: 20px;
    .head {
        margin: 0 0 10px;
        width: 400px;
        padding: 0;
    }
    .tips {
        display: block;
        margin: 0 0 20px 20px;
    }
}
</style>
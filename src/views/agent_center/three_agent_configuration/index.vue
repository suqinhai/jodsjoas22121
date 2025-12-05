<template>
    <!-- 代理中心-三级代理配置 -->
    <div class="container three-agent-configuration">
        <div class="title">{{$t('三级代理配置')}}</div>
        <el-form ref="addFrom" class="filter-form" :model="state.formData">
            <el-form-item :label="$t('三级代理奖励开关')">
                <el-checkbox-group v-model="state.formData.rewardOnOff" :disabled="state.formDataDisabled">
			        <el-checkbox :label="1" :value="1">{{$t('已开启')}}</el-checkbox>
			    </el-checkbox-group>
            </el-form-item>
            <el-table class="table-box wd600" :data="state.tableList" border>
                <el-table-column prop="level" :label="$t('级别')" align="center" min-width="120" />
                <el-table-column :label="$t('比例%')" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-input-number :disabled="state.formDataDisabled" v-model="row.probability" class="wd200" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="0" :max="100" />
                    </template>
                </el-table-column>
            </el-table>
            <el-form-item>
                <div class="btn-box" v-permiss="'merchant.third-level-agent.editDefaultConfig'">
                    <el-button v-throttle type="primary" @click="state.formDataDisabled = false" v-if="state.formDataDisabled">
                        {{$t('修 改')}}
                    </el-button>
                    <el-button v-throttle @click="state.formDataDisabled = true;getConfigShareBenefit()"  v-if="!state.formDataDisabled">
                        {{$t('取 消')}}
                    </el-button>
                    <el-button v-throttle type="primary" @click="saveConfigShareBenefit(addFrom)" v-if="!state.formDataDisabled">
                        {{$t('保 存')}}
                    </el-button>
                </div>
            </el-form-item>
        </el-form>
        <div class="title">{{$t('掉绑配置')}}</div>
        <el-form ref="addFrom2" class="filter-form" :model="state.formData2">
            <el-form-item :label="$t('代理掉绑开关')">
                <el-checkbox-group v-model="state.formData2.mbOnOff" :disabled="state.formData2Disabled">
			        <el-checkbox :label="1" :value="1">{{$t('已开启')}}</el-checkbox>
			    </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('邀请几人后开始掉绑')">
                <el-input-number :disabled="state.formData2Disabled" v-model="state.formData2.beginNum" class="wd200" :placeholder="$t('请输入')" :controls="false" :min="0" :precision="0" />
            </el-form-item>
            <el-form-item :label="$t('掉绑方式')">
                <el-radio-group v-model="state.formData2.mbMode" style="width: 100%;" :disabled="state.formData2Disabled">
                    <el-radio :label="1" :value="1">{{$t('概率')}}</el-radio>
                    <el-radio :label="2" :value="2">{{$t('固定')}}</el-radio>
                </el-radio-group>
                <el-input-number v-model="state.formData2.mbValue" :disabled="state.formData2Disabled" class="wd200" :placeholder="$t('请输入')" :controls="false" :precision="0" :min="1" :max="100"/>
                <div class="tips" v-if="state.formData2.mbMode == 1">{{$t('掉绑概率(百分比): 比如设置邀请10人后开始掉绑，掉绑概率50%，那么第11个玩家50%概率掉绑')}}</div>
                <div class="tips" v-if="state.formData2.mbMode == 2">{{$t('固定掉绑: 每邀请几人里掉绑1人，比如邀请10人后开始掉绑，每邀请5人里掉绑1人，那么第15个玩家掉绑')}}</div>
            </el-form-item>
            <el-form-item>
                <div class="btn-box" v-permiss="'merchant.third-level-agent.editDefaultConfig-1'">
                    <el-button v-throttle type="primary" @click="state.formData2Disabled = false" v-if="state.formData2Disabled">
                        {{$t('修 改')}}</el-button>
                        <el-button v-throttle @click="state.formData2Disabled = true;getConfigShareBenefit()" v-if="!state.formData2Disabled">
                            {{$t('取 消')}}</el-button>
                    <el-button v-throttle type="primary" @click="saveConfigUnbind(addFrom2)" v-if="!state.formData2Disabled">
                        {{$t('保 存')}}</el-button>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup name="threeAgentConfiguration">
import { reactive, ref, onMounted } from 'vue';
import { getDefaultConfig, postEditDefaultConfig } from '@/api/agent';
import { ElMessage } from 'element-plus';
import userStore from '@/store/user'

const state = reactive({
    tableList: [{
        level: 1,
    }, {
        level: 2,
    }, {
        level: 3,
    }],
    formData: {},
    formData2: {},
    formDataDisabled: true,
    formData2Disabled: true
})
const addFrom = ref(null)
const addFrom2 = ref(null)
const userData = userStore()

onMounted(() => {
    getConfigShareBenefit()
})


const getConfigShareBenefit = () => {
    getDefaultConfig().then(res => {
        state.formData2.mbOnOff = res.data.mbOnOff ? [1] : []
        state.formData2.beginNum = res.data.beginNum
        state.formData2.mbMode = res.data.mbMode || 1
        state.formData2.mbValue = res.data.mbValue
        state.formData.rewardOnOff = res.data.rewardOnOff ? [1] : []
        if(res.data.rewardShare){
            state.tableList = res.data.rewardShare?.split(',').map((item,index) => { 
                return {
                    level: index+1,
                    probability: item
                }
            })
        }
    })
}

const saveConfigShareBenefit = (el) => {
    let isError = false
    let probabilityNum = 0
    state.tableList.forEach(item => {
        if(item.probability){
            probabilityNum += (+item.probability)
        }
        if(!item.probability && item.probability !== 0 && !isError){
            console.log(item.probability)
            isError = true
            ElMessage.warning($t('请设置比例'))
            return
        }
    })
    if(isError){return}
    if(probabilityNum > 100){
        ElMessage.warning($t('比例总和小于或等于100'))
        return
    }
    const params = {
        ...state.formData,
        type: 1,
        rewardOnOff: state.formData.rewardOnOff?.length ? 1 : 0,
        rewardShare: state.tableList.map(item => {
            return item.probability
        }).join(',')
    }
    globalVBus.$emit('globalLoading', true)
    postEditDefaultConfig(params).then((res) => {
        state.formDataDisabled = true
        getConfigShareBenefit()
        globalVBus.$emit('globalLoading', false)
    }).catch((data) => {
        globalVBus.$emit('globalLoading', false)
    })
}

const saveConfigUnbind = (el) => {
    if(!state.formData2.mbValue && state.formData2.mbValue !== 0 || !state.formData2.beginNum && state.formData2.beginNum !== 0){
        ElMessage.warning($t('请完善配置'))
        return
    }
    const params = {
        ...state.formData2,
        type: 2,
        mbOnOff: state.formData2.mbOnOff?.length? 1 : 0,
    }
    globalVBus.$emit('globalLoading', true)
    postEditDefaultConfig(params).then((res) => {
        state.formData2Disabled = true
        getConfigShareBenefit()
        globalVBus.$emit('globalLoading', false)
    }).catch((data) => {
        globalVBus.$emit('globalLoading', false)
    })
}

</script>

<style lang="scss" scoped>
.three-agent-configuration{
    .title{
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 20px;
    }
    .btn-box{
        text-align: center;
        width: 100%;
        margin-top: 20px;
    }
    .filter-form{
        width: 600px;
        padding-left: 50px;
    }
    .wd200{
        width: 200px;
    }
    .wd600{
        width: 600px;
    }
    .tips{
        line-height: 20px;
        margin-top: 10px;
    }
}

</style>

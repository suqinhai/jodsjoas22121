<template>
    <!-- 站点配置-客服配置-客服配置 -->
    <div class="tabs-main service-set">
        <div class="head">
            <div class="tips">{{$t('注：配置后将在客服页面对应显示')}}</div>
            <div class="operate" v-if="isPermiss">
                <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
                <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            </div>
        </div>
        <el-form ref="deployForm" :model="state.formData" :disabled="state.isDisabled">
            <div class="main-box">

                <el-table :data="state.formData" border>
                    <el-table-column :label="$t('排序')" width="100" align="center">
                        <template #default="{ row, $index }">
                            <div v-if="state.isDisabled">{{row.sort}}</div>
                            <el-form-item v-else :prop="$index + '.sort'" :rules="{ required: true, message: '', trigger: 'blur'}" label-width="0">
                                <el-input-number :disabled="state.isDisabled" v-model="row.sort" style="width: 100%" :controls="false" :precision="0"
                                    :min="1" :placeholder="$t('排序')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('类型')" min-width="120" align="center">
                        <template #default="{ row, $index  }">
                            <el-form-item :prop="$index + '.type'" :rules="{ required: true, message: '', trigger: 'change'}" label-width="0">
                                <el-select :disabled="state.isDisabled" style="width: 100%;" v-model="row.type">
                                    <el-option v-for="item in state.customCSType" :key="item.value" :label="item.label" :value="+item.value" />
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('显示名称')" min-width="160" align="center">
                        <template #default="{ row, $index }">
                            <div v-if="state.isDisabled">{{row.name}}</div>
                            <el-form-item v-else :prop="$index + '.name'" :rules="[
                                {
                                    required: true,
                                    message: '',
                                    trigger: 'blur',
                                },
                            ]" label-width="0">
                                <el-input :disabled="state.isDisabled" v-model="row.name" style="width: 100%" show-word-limit maxlength="20"
                                    :placeholder="$t('显示名称')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('客服链接')" min-width="300" align="center">
                        <template #default="{ row, $index }">
                            <div v-if="state.isDisabled">{{row.link}}</div>
                            <el-form-item v-else :prop="$index + '.link'" :rules="[
                                {
                                    required: true,
                                    message: '',
                                    trigger: 'blur',
                                },
                            ]" label-width="0">
                                <el-input :disabled="state.isDisabled" v-model="row.link" style="width: 100%" :placeholder="$t('客服链接')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="operate-box">
                    <el-button v-throttle :disabled="state.isDisabled" class="but" type="primary" @click="handleAdd" :icon="Plus">
                    </el-button>
                    <el-button v-throttle :disabled="state.isDisabled || !state.formData.length" class="but" type="danger" @click="handleDel"
                        :icon="Minus">
                    </el-button>
                </div>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Minus } from "@element-plus/icons-vue"
import userStore from '@/store/user'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { getCommonMeta } from '@/api/common'

const state = reactive({
    formData: [],
    customCSType: [],
    isDisabled: true,
})
const userData = userStore()
const deployForm = ref(null)

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.app.layout-cs')
})

onMounted(async () => {
    if (isPermiss.value) {
        let { data } = await getCommonMeta({ types: 'customCSType' })
        state.customCSType = data.customCSType || []
        getData()
    }
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'customCS', type: 'cs' }).then(({ data }) => {
        state.formData = data || []
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.formData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 增加
const handleAdd = (index) => {
    state.formData.push({
        type: '',
        sort: undefined,
        name: '',
        link: ''
    })
}

// 删除
const handleDel = () => {
    state.formData.pop()
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            globalVBus.$emit('globalLoading', true)
            postHomeDeploy({
                part: 'customCS',
                alias: 'customCS',
                type: 'cs',
                status: 1,
                customCS: JSON.stringify(state.formData.map(item => {
                    if (item.link && item.link.indexOf('http') !== 0) {
                        item.link = 'https://' + item.link
                    }
                    return item
                }))
            }).then((res) => {
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss">
.service-set {
    .head {
        padding-right: 112px;
        display: flex;
        align-items: flex-end;
        margin-bottom: 10px;
        .tips {
            flex: 1;
            color: red;
        }
    }
    .main-box {
        display: flex;
        align-items: flex-end;
        .operate-box {
            margin-left: 20px;
            display: flex;
        }
    }
    .but {
        width: 40px;
    }
}
</style>

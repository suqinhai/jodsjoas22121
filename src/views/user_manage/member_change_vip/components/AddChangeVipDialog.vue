<template>
    <!-- 会员vip等级调整-新增 -->
    <Dialog ref="dialog" width="605" :title="$t('新增')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)"
        @cancel="cancel">
        <el-form ref="addFrom" :model="form" :label-width="$locale == 'zh' ? '150px' : 'auto'" :rules="form.rules">
            <el-form-item :label="$t('会员ID:')" prop="userId">
                <el-input :disabled="state.isSearch" @input="(val) => form.userId = val.replace(/\D/g,'')" v-model="form.userId"
                    style="width: 260px;margin-right: 10px" :placeholder="$t('输入会员ID，进行搜索确认会员存在')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row v-if="state.memberInfo.id">
                <el-col :span="9">
                    <el-form-item :label="$t('会员ID:')">
                        <span style="white-space: nowrap;">{{state.memberInfo.id}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="15">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{state.memberInfo.name}}</span>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item :label="$t('vip修改值:')" prop="level">
                <el-select class="select-box" v-model="form.level" :placeholder="$t('请选择vip修改值')">
                    <el-option v-for="item in form.userLevel" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { levelEditData } from '@/api/member'
import { getUserGradeData, getUserBaseDetail } from '@/api/common'

const addFrom = ref(null)
const dialog = ref(null)
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    isSearch: false,
    memberInfo: {}
})
const form = reactive({
    userId: '',
    level: '',
    type: 2,
    userLevel: [],
    rules: {
        userId: [{ required: true, message: $t('请输入会员ID'), trigger: 'blur' }],
        level: [{ required: true, message: $t('请选择vip修改值'), trigger: 'change' }],
    }
})

const handleSearch = () => {
    if (state.isSearch) {
        form.userId = undefined
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!form.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: form.userId }).then((res) => {
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
            } else {
                ElMessage.warning($t('未查询到此会员ID信息！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            dialog.value.closeLoading()
        })
    }
}

getUserGradeData().then(({ data }) => {
    if (data) {
        for (let key in data) {
            form.userLevel.push({
                label: data[key],
                value: key,
            })
        }
    }
})

const confirmEdit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const { userId, level, type } = form
            dialog.value.showLoading()
            getUserBaseDetail({ id: form.userId }).then((res) => {
                if (res.data) {
                    levelEditData({
                        userId,
                        level,
                        // type
                    }).then(res => {
                        if (res.code === 0) {
                            emits('close')
                            emits('refresh')
                        }
                    })
                } else {
                    ElMessage.warning($t('会员ID不存在！'))
                }
                dialog.value.closeLoading()
            }).catch((data) => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
.red {
    color: red;
}
</style>
<template>
    <!-- 代理上级更改溯源-新增 -->
    <Dialog width="700" :title="$t('新增')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :model="form" :label-width="$locale == 'zh' ? '150px' : 'auto'" :rules="form.rules">
            <el-form-item :label="$t('会员ID：')" prop="userId">
                <el-input v-model="form.userId" :placeholder="$t('请输入会员ID')" @input="(val) => form.userId = val.replace(/\D/g,'')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('绑定上级代理ID：')" prop="tradeAmount">
                <el-input v-model="form.inviteUserId" :placeholder="$t('不填写则会调整为顶级代理')"></el-input>
            </el-form-item>
            <div>{{$t('注：佣金结算期间不允许修改上级（商户本地时间01：00：00-04：00：00开始结算）。')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { postChangeEdit } from '@/api/agent'
import { ElMessage, ElMessageBox } from 'element-plus'

const addFrom = ref(null)
const emits = defineEmits(['close', 'refresh'])
const form = reactive({
    userId: '',
    inviteUserId: '',
    rules: {
        userId: [{ required: true, message: $t('请输入代理ID'), trigger: 'change' }],
    }
})

const confirmEdit = (el) => {
    const { userId, inviteUserId } = form
    if (!userId) {
        return ElMessage.warning($t('请输入会员ID'))
    }
    if (inviteUserId) {
        confirmEditSave()
    } else {
        ElMessageBox.alert($t('你当前未填写上级代理ID，如果保存将会调整为顶级代理，是否确定？'), $t('提示'), {
            confirmButtonText: $t('确定'),
            callback: (action) => {
                if (action === 'confirm') {
                    confirmEditSave()
                }
            },
        })
    }
}


const confirmEditSave = () => {
    const { userId, inviteUserId } = form
    postChangeEdit({
        userId,
        inviteUserId
    }).then(res => {
        if (res.code === 0) {
            emits('close')
            emits('refresh')
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
<template>
    <!-- 人事权限 -->
    <div class="container permission-setting">
        <div class="hand" v-permiss="'admin.role.edit'" v-if="userData.userInfo.asSuper">
            <el-button v-throttle type="primary" @click="handleConfig">{{$t('新增角色')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" label="ID" width="120" align="center" />
            <el-table-column prop="name" :label="$t('角色名称')" min-width="160" align="center" />
            <el-table-column prop="info" :label="$t('角色描述')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="240">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text v-if="row.canGrant && row.canDelete && isPermiss" @click="handleConfig( row )">{{$t('修改')}}</el-button>
                    <el-button v-throttle type="danger" text v-if="row.canDelete && isPermiss" @click="handleDelete( row.id )">{{$t('删除')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.canGrant && userData.isHasPermiss('admin.role.grant')"
                        @click="router.push('/personnel-center/mix-permission?id='+ row.id)">{{$t('分配权限')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData" />

        <RoleDeploy v-if="state.dialogShow" :itemData="state.itemData" @fetchData="fetchData" @close="state.dialogShow = false">
        </RoleDeploy>
    </div>
</template>

<script setup name='permissionSetting'>
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { getRoleList, deleteRoleData } from '@/api/manage_config'
const RoleDeploy = defineAsyncComponent(() => import('./components/RoleDeploy.vue'))

const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    dialogShow: false
})
const router = useRouter()
const userData = userStore()

const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.role.delete')
})

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    let params = { ...state.listQuery }
    params.username = state.username
    globalVBus.$emit('globalLoading', true)
    getRoleList(params).then(res => {
        let { total, list } = res.data
        state.total = total || 0
        state.tableData = list || []
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (val = {}) => {
    state.itemData = { ...val }
    state.dialogShow = true
}

const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定要删除此角色吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        showClose: true,
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteRoleData({ id }).then(res => {
            // ElMessage.success($t('操作成功！'));
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
.permission-setting {
    .hand {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
        padding-right: 20px;
    }
}
</style>

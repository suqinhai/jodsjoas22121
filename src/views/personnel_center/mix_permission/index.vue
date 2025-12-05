<template>
    <!-- 角色权限分配 -->
    <div class="container mix-permission">
        <div class="filter">
            <el-input v-model="state.searchNames" :placeholder="$t('一级菜单搜索，支持空格隔开的多关键字匹配')" @input="changeSearchIds" />
        </div>
        <el-table :row-key="(row) => row.id" table-layout="auto" :show-header="false" :data="state.allPermission" ref="tableRef">
            <el-table-column type="expand" :label="$t('一级权限')">
                <template #default="{ row }">
                    <div class="permission" v-if="row.children && row.children.length > 0">
                        <el-checkbox v-model="row.checkAll" :indeterminate="row.isIndeterminate" @change="handleCheckAllChange(row)">Check all
                        </el-checkbox>
                        <el-table :data="row.children" ref="tableRefnd" :show-header="false" border table-layout="auto">
                            <el-table-column prop="name" :label="$t('二级权限')">
                                <template #default="{ row }">
                                    <div>
                                        <el-checkbox :label="row.id" v-model="row.checked" :disabled="!canSelected(row)" @change="handleClickst(row)">
                                            {{ row.name }}</el-checkbox>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('三级菜单权限/操作权限')">
                                <template #default="{ row }">
                                    <div v-if="row.children && row.children.length > 0">
                                        <template v-if="!row.children[0].isMenu">
                                            <div>
                                                <el-checkbox v-model="row.checkAll" :indeterminate="row.isIndeterminate"
                                                    @change="handleCheckAllChange(row)">Check all</el-checkbox>
                                            </div>
                                            <el-checkbox v-for="item in row.children" :key="item.id" :label="item.id" v-model="item.checked"
                                                @change="handleClickst(item)">{{ item.name }}</el-checkbox>
                                        </template>
                                        <template v-else>
                                            <el-checkbox v-model="row.checkAll" :indeterminate="row.isIndeterminate"
                                                @change="handleCheckAllChange(row)">Check all</el-checkbox>
                                            <el-table :data="row.children" :show-header="false" border table-layout="auto">
                                                <el-table-column prop="name" :label="$t('三级菜单权限')">
                                                    <template #default="{ row }">
                                                        <div>
                                                            <el-checkbox :label="row.id" v-model="row.checked" :disabled="!canSelected(row)"
                                                                @change="handleClickst(row)">
                                                                {{ row.name }}</el-checkbox>
                                                        </div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column prop="name" :label="$t('四级操作权限')">
                                                    <template #default="{ row }">
                                                        <div v-if="row.children && row.children.length > 0">
                                                            <div>
                                                                <el-checkbox v-model="row.checkAll" :indeterminate="row.isIndeterminate"
                                                                    @change="handleCheckAllChange(row)">Check all</el-checkbox>
                                                            </div>
                                                            <el-checkbox v-for="item in row.children" :key="item.id" :label="item.id"
                                                                @change="handleClickst(item)" v-model="item.checked">{{ item.name }}</el-checkbox>
                                                        </div>
                                                        <div v-else>{{$t('暂无相关权限')}}</div>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </template>

                                    </div>
                                    <span v-else>{{$t('暂无相关权限')}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <el-empty v-else :image-size="100" />
                </template>
            </el-table-column>
            <el-table-column type="selection" :reserve-selection="true" :selectable="canSelected">
                <template #default="{ row }">
                    <el-checkbox :indeterminate="row.selfIndeterminate" :disabled="!canSelected(row)" @change="handleCheckTopMenu(row)"
                        v-model="row.checked"> </el-checkbox>
                </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('全选')" />
        </el-table>
        <div class="but">
            <el-button v-throttle size="large" @click="handleCancel">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left: 20px" type="primary" size="large" @click="handleSubmit">{{$t('确 认')}}</el-button>
        </div>
    </div>
</template>

<script setup name="mixPermission">
import { reactive, ref, onMounted, onActivated } from 'vue'
import { fetchTree } from '@/common/util/index'
import { getRolePermissionData, postRolePermissionData } from '@/api/manage_config.js'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'

const route = useRoute()
const router = useRouter()
const state = reactive({
    searchNames: '',
    allPermission: [],
    currentRoleIdPermission: [],
    roleId: ''
})
const tableRef = ref(null)
const tableRefnd = ref(null)

onMounted(() => {
    const { query } = route
    state.roleId = query.id
    getRoleMenusApi({ roleId: query.id })
})

onActivated(() => {
    const { query } = route
    if (query.id && state.roleId && state.roleId !== query.id) {
        state.roleId = query.id
        getRoleMenusApi({ roleId: query.id })
    }
})

// 搜索功能，暂时隐藏不做
const changeSearchIds = debounce((value) => {
    if (value.indexOf('') < 0) {
        //没有空格
        state.allPermission.forEach((item) => {
            if (item.name == state.searchNames) {
                tableRef.value.toggleRowExpansion(item, true)
            } else {
                tableRef.value.toggleRowExpansion(item, false)
            }
        })
    } else {
        //有空格
        value
            .trim()
            .split(' ')
            .forEach((item) => {
                state.allPermission.forEach((it) => {
                    if (item == it.name) {
                        tableRef.value.toggleRowExpansion(it, true)
                    }
                })
            })
    }
}, 500)

//获取全部权限
const getRoleMenusApi = async (params) => {
    try {
        globalVBus.$emit('globalLoading', true)
        const res = await getRolePermissionData(params)
        if (res.code == 0) {
            state.allPermission = fetchTree(res.data, 'id', 'pId').filter(item => item.pId === 0)
            state.allPermission.forEach((item) => {
                if (item.children) loopAddCheckedList(item)
            })
        }
        globalVBus.$emit('globalLoading', false)
    } catch (err) {
        globalVBus.$emit('globalLoading', false)
    }

}

// 循环判断选中状态
const loopAddCheckedList = (parentNode, level = 1) => {
    parentNode.checkedList = []
    parentNode.checkAll = false
    level += 1
    if (parentNode.children && parentNode.children.length) {
        parentNode.children.forEach((item) => {
            if (item.checked) parentNode.checkedList.push(item.id)
            if (item.isMenu && item.children) {
                if (level < 3) loopAddCheckedList(item, level)
                if (level > 2) {
                    item.children.forEach((its) => {
                        if (its.checked) parentNode.checkedList.push(its.id)
                        parentNode.children.push(its)
                    })
                    item.isMenu = false
                    delete item.children
                }
            }
        })
    }
    parentNode.checkAll =
        parentNode.checkedList.length === parentNode.children.length
    if (
        !parentNode.checkAll &&
        parentNode.children.find((item) => item.checked)
    ) {
        parentNode.isIndeterminate = true
    } else {
        parentNode.isIndeterminate = false
    }
    if (!parentNode.checkAll && parentNode.checked && parentNode.pId === 0)
        parentNode.selfIndeterminate = true
}


// 点击单个复选框时，轮询查找父节点，同时选中父节点
const handleClickst = (row) => {
    // if (row.pId === 0) return
    let parentId = row.pId
    let parentItem = loopFindParentItem(state.allPermission, parentId)
    if (!parentItem) return
    parentItem.checkedList = []
    parentItem.children.forEach((item) => {
        if (item.checked) {
            parentItem.checked = true
            parentItem.checkedList.push(item.id)
        }
    })
    parentItem.checkAll =
        parentItem.checkedList.length === parentItem.children.length
    if (
        parentItem.children.find((item) => item.checked) &&
        !parentItem.checkAll
    ) {
        parentItem.isIndeterminate = true
    } else {
        parentItem.isIndeterminate = false
    }
    if (!parentItem.checkAll && parentItem.checked && parentItem.pId === 0) parentItem.selfIndeterminate = true
    if (parentItem.checkAll && parentItem.pId === 0) parentItem.selfIndeterminate = false
    if (parentItem.pId !== 0) handleClickst(parentItem)
}

// 获取父节点
const loopFindParentItem = (list, pId) => {
    let parentItem
    let stopFind = false
    list.find((item) => {
        if (stopFind) return
        if (item.id === pId) {
            parentItem = item
            stopFind = true
        } else if (
            item.isMenu &&
            item.children &&
            item.children.length &&
            item.children[0].isMenu
        ) {
            if (loopFindParentItem(item.children, pId)) {
                parentItem = loopFindParentItem(item.children, pId)
                stopFind = true
            }
        }
    })
    return parentItem ? parentItem : null
}

//取出所有已选择的权限Id;
const getMenuIds = (arr) => {
    if (!Array.isArray(arr)) arr
    arr.forEach((item) => {
        if (item.checked) {
            menuIds.push(item.id)
        }
        if (item.children) {
            getMenuIds(item.children)
        }
    })
}

let menuIds = []

const handleSubmit = () => {
    menuIds = []
    getMenuIds(state.allPermission)
    let data = {
        id: route.query.id,
        menuIds: menuIds.join(','),
    }
    globalVBus.$emit('globalLoading', true)
    postRolePermissionData(data).then(() => {
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

//点击取消
const handleCancel = () => {
    router.go(-1)
}

// 全选
const handleCheckAllChange = (row) => {
    if (row.checkAll) {
        row.checked = true
        row.checkedList = row.children.map((item) => item.id)
        handleClickst(row)
    } else {
        row.checkedList = []
    }
    row.isIndeterminate = false
    if (row.pId === 0) row.selfIndeterminate = row.checkAll ? false : true
    // row.children.forEach(item => item.checked = row.checkAll)
    loopChooseAllChildren(row.children, row.checkAll)
}

// 轮询给子节点toggle选中状态
const loopChooseAllChildren = (list, isCheck) => {
    list.forEach((item) => {
        item.checked = isCheck
        if (item.children && item.children.length) {
            item.isIndeterminate = false
            item.checkAll = isCheck
            if (isCheck) {
                item.checkedList = item.children.map((v) => v.id)
            } else {
                item.checkedList = []
            }
            if (!item.checkAll) item.checkedList = []
            loopChooseAllChildren(item.children, isCheck)
        }
    })
}

// 子节点有选中状态时，当前节点不能取消选中状态
const canSelected = (row, index) => {
    let show = true
    if (row.children && row.children.length) {
        let item = row.children.find((item) => item.checked)
        if (item) show = false
    }
    return show
}

const handleCheckTopMenu = (row) => {
    if (row.children) {
        row.selfIndeterminate = row.checked ? true : false
    }
}
</script>

<style lang="scss" scoped>
.mix-permission {
    width: 100%;
    height: 100%;

    .el-table {
        flex: 1;
        .permission {
            width: 90%;
            margin: auto;
        }
    }

    .but {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        .el-button {
            min-width: 80px;
        }
    }

    .filter {
        margin-bottom: 10px;
    }
}
</style>

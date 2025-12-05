<template>
    <div class="top-menu">
        <el-menu
            class="top-menu-el-menu"
            :default-active="activeMenu"
            mode="horizontal"
            background-color="#324157"
            text-color="#bfcbd9"
            active-text-color="#20a0ff"
            :ellipsis="false"
            router
        >
            <template v-for="item in userStore.menuList">
                <template v-if="item.children">
                    <el-sub-menu popper-class="top-sub-menu-poppers" :index="item.path" :key="item.path">
                        <template #title>
                            <svg-icon :iconClass="item.icon" class="menu-icon"></svg-icon>
                            <span class="menu-title">{{ item.name }}</span>
                        </template>
                        <template v-for="subItem in item.children">
                            <el-sub-menu v-if="subItem.children" :index="subItem.path" :key="subItem.path">
                                <template #title>
                                    <span>{{ subItem.name }}</span>
                                </template>
                                <el-menu-item v-for="(threeItem, i) in subItem.children" :key="i" :index="threeItem.path">
                                    <span>{{ threeItem.name }}</span>
                                </el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="subItem.path" :key="subItem.path">
                                <span>{{ subItem.name }}</span>
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.path" :key="item.path">
                        <svg-icon :iconClass="item.icon" class="menu-icon"></svg-icon>
                        <span class="menu-title">{{ item.name }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
        <!-- 菜单搜索 -->
        <el-select
            v-model="searchText"
            filterable
            :placeholder="$t('搜索菜单')"
            clearable
            @change="addTag"
            class="menu-search"
        >
            <el-option v-for="item in menuOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
    </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import useUserStore from "@/store/user"

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const menuOptions = reactive([])
const searchText = ref()
const activeMenu = ref('')

watch(
    () => route.path,
    (val) => {
        if (val !== '/') {
            activeMenu.value = val
        }
    },
    { immediate: true }
)

const loopMenu = (list) => {
    list.forEach(item => {
        if (item.children) {
            loopMenu(item.children)
        } else {
            if (item.id) menuOptions.push(item)
        }
    })
}

const addTag = (v) => {
    if (v) {
        let item = menuOptions.find(item => item.id === v)
        router.push(item.path)
    }
}

onMounted(() => {
    loopMenu(userStore.menuList)
})
</script>

<style lang="scss">
.top-menu {
    display: flex;
    align-items: center;
    background-color: #324157;
    padding: 0 10px;
    height: 50px;

    .menu-search {
        width: 150px;
        margin-left: 10px;
        flex-shrink: 0;

        .el-input__wrapper {
            background-color: #3a4a5e;
            box-shadow: none;
        }

        .el-input__inner {
            color: #bfcbd9;

            &::placeholder {
                color: #8a9aaa;
            }
        }
    }

    .menu-icon {
        font-size: 16px;
        margin-right: 5px;
    }

    .menu-title {
        font-size: 14px;
    }
}

.top-menu-el-menu {
    flex: 1;
    background-color: #324157 !important;
    border-bottom: none !important;
    height: 50px;
    overflow-x: auto;
    overflow-y: hidden;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #5a6a7e;
        border-radius: 2px;
    }

    &::-webkit-scrollbar-track {
        background-color: #324157;
    }

    .el-menu-item,
    .el-sub-menu__title {
        height: 50px !important;
        line-height: 50px !important;
        padding: 0 15px !important;
        border-bottom: none !important;

        &:hover {
            background-color: #3a4a5e !important;
        }
    }

    .el-menu-item.is-active {
        background-color: #3a4a5e !important;
        border-bottom: 2px solid #20a0ff !important;
    }

    .el-sub-menu.is-active > .el-sub-menu__title {
        border-bottom: 2px solid #20a0ff !important;
    }
}

.top-sub-menu-poppers {
    .el-menu {
        background-color: #324157 !important;
        max-height: calc(100vh - 150px);
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #5a6a7e;
            border-radius: 2px;
        }
    }

    .el-menu-item {
        background-color: #324157 !important;
        color: #bfcbd9 !important;
        min-width: 150px;

        &:hover {
            background-color: #3a4a5e !important;
        }

        &.is-active {
            color: #20a0ff !important;
            background-color: #3a4a5e !important;
        }
    }

    .el-sub-menu__title {
        background-color: #324157 !important;
        color: #bfcbd9 !important;

        &:hover {
            background-color: #3a4a5e !important;
        }
    }
}
</style>

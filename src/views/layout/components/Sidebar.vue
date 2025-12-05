<template>
    <div class="sidebar">
        <el-select v-model="searchText" filterable :placeholder="$t('请输入菜单名称')" clearable @change="addTag" v-if="!sidebar.collapse">
            <el-option v-for="item in menuOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-menu class="sidebar-el-menu " :default-active="activeMenu" :collapse="sidebar.collapse" background-color="#324157" text-color="#bfcbd9"
            active-text-color="#20a0ff" unique-opened router>
            <template v-for="item in userStore.menuList">
                <template v-if="item.children">
                    <el-sub-menu popper-class="sub-menu-poppers" :index="item.path" :key="item.path">
                        <template #title>
                            <!-- <el-icon>
                                <component :is="item.icon"></component>
                            </el-icon> -->
                            <!-- <img class="menu-icon" :src="getImageUrl(item.icon)" alt=""> -->
                            <svg-icon :iconClass="item.icon" class="menu-icon el-icon"></svg-icon>
                            <span class="over1line" v-if="$locale == 'zh'">{{item.name}}</span>
                            <el-tooltip class="box-item" effect="dark" :content="item.name" placement="right-start" v-else>
                                <span class="over1line">{{item.name}}</span>
                            </el-tooltip>
                        </template>
                        <el-menu-item-group>
                            <template v-for="subItem in item.children">
                                <el-sub-menu v-if="subItem.children" :index="subItem.path" :key="subItem.path">
                                    <template #title v-if="$locale == 'zh'">
                                        <span class="over1line">{{subItem.name}}</span>
                                    </template>
                                    <template #title v-else>
                                        <el-tooltip class="box-item" effect="dark" :content="subItem.name" placement="right-start">
                                            <span class="over1line">{{subItem.name}}</span>
                                        </el-tooltip>
                                    </template>
                                    <el-menu-item v-for="(threeItem, i) in subItem.children" :key="i" :index="threeItem.path">
                                        <span class="over1line" v-if="$locale == 'zh'">{{threeItem.name}}</span>
                                        <el-tooltip class="box-item" effect="dark" :content="threeItem.name" placement="right-start" v-else>
                                            <span class="over1line">{{threeItem.name}}</span>
                                        </el-tooltip>
                                    </el-menu-item>
                                </el-sub-menu>
                                <el-menu-item v-else :index="subItem.path">
                                    <span class="over1line" v-if="$locale == 'zh'">{{subItem.name}}</span>
                                    <el-tooltip class="box-item" effect="dark" :content="subItem.name" placement="right-start" v-else>
                                        <span class="over1line">{{subItem.name}}</span>
                                    </el-tooltip>
                                </el-menu-item>
                            </template>
                        </el-menu-item-group>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.path" :key="item.path">
                        <!-- <el-icon>
                            <component :is="item.icon"></component>
                        </el-icon> -->
                        <span class="el-icon menu-box">
                            <svg-icon :iconClass="item.icon" class="menu-icon"></svg-icon>
                        </span>
                        <template #title v-if="$locale == 'zh'">{{ item.name }}</template>
                        <template #title v-else>
                            <el-tooltip class="box-item" effect="dark" :content="item.name" placement="right-start">
                                <span class="over1line">{{item.name}}</span>
                            </el-tooltip>
                        </template>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import { computed, reactive, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import useSidebarStore from "@/store/sidebar"
import useUserStore from "@/store/user"
import { useRouter } from "vue-router"

const userStore = useUserStore()
const sidebar = useSidebarStore()
const route = useRoute()
const menuOptions = reactive([])
const searchText = ref()
const activeMenu = ref('')
const router = useRouter()

// const onRoutes = computed(() => {
//     return route.path
// })

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
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: hidden;
    background-color: #324157;
    .el-menu-item-group__title {
        display: none !important;
    }
    .menu-box {
        display: inline-flex;
        width: 15px !important;
    }
    .menu-icon {
        font-size: 15px;
        margin-top: -2px;
    }
    > .el-select {
        width: calc(100% - 12px);
        margin-left: 5px;
        box-sizing: border-box;
    }
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 200px;
}

.sidebar > ul {
    height: calc(100% - 32px);
    overflow-y: scroll;
    &::-webkit-scrollbar {
        width: 0;
    }
}

::v-deep .el-menu--collapse .el-menu .el-submenu,
.el-menu--popup {
    min-width: 120px !important;
}

.sub-menu-poppers {
    .el-menu-item-group {
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        &::-webkit-scrollbar {
            width: 0;
        }
    }
    .el-menu-item-group__title {
        display: none !important;
    }
}
</style>

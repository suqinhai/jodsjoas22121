<template>
    <!-- 站点配置-子站点配置-温馨提示 -->
    <Dialog width="900" :title="$t('温馨提示')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [1,9,12,14].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    { title: $t('子站点列表：'), text: $t('列表根据站点创建时，选择模版则显得复制的站点配置数量，未选择站点则显示‘去配置’点击进入；') },
    { title: $t('账单费用：'), text: $t('统计站点所有账单；') },

    { title: $t('站点创建完成默认建设中状态：'), text: $t('') },
    { title: $t(''), text: $t('修改状态判断配置是否完整（必填项判断）；') },
    { title: $t('前端域名配置：'), text: $t('需判断已配置并存在已解析验证域名；') },
    { title: $t('Logo设置：'), text: $t('跳转到站点配置-首页模块设置，开站前至少有一个配置；') },
    { title: $t('注册方式：'), text: $t('配置注册方式，已开启注册配置；') },
    { title: $t('开放厂家：'), text: $t('点击进入游戏中心-游戏平台列表，显示平台开关已开启是厂家数量，开站前至少有一个配置；复制站点需判断：该站点是否未设置过，已设置则提示：‘站点已经存在配置，不可替换’；') },
    { title: $t('Banner：'), text: $t('点击进入运营中心-宣传管理，显示已经配置的大厅banner宣传图数量；开站前至少有一个配置；复制站点需判断：该站点是否未设置过，已设置则提示：‘站点已经存在配置，不可替换’；') },

    { title: $t('复制站点：'), text: $t('') },
    { title: $t('选择源站点：'), text: $t('选择需要被复制的站点；') },
    { title: $t('选择复制类型和目标站点：'), text: $t('选择要复制的站点类型，显示出可复制的站点当前配置。') },

]
</script>

<style lang="scss">
</style>

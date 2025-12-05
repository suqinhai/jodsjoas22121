<template>
    <!-- 站点域名-域名管理-前台域名管理/后台域名管理-限额说明 -->
    <Dialog width="760" :title="$t('限额说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [9,16].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <div class="title">{{item.title}}</div>
                <div class="text" v-for="(its,ins) in item.content" :key="ins">{{its}}</div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    {
        title: $t('1.域名不是越多越好：'),
        content: [$t('因为每个节点的域名都要检测网络质量，然后再根据网络质量排序，若节点域名数量过多，每次巡检都要浪费1-2秒来测速，进而会导致网络卡顿的情况，建议每个功能用途控制在2-10个/节点。')]
    },
    {
        title: $t('2.历史旧域名过多如何处理？'),
        content: [
            $t('历史使用过或旧的域名，建议用URL转发跳转，不仅能保留权重，也能无限量跳转。'),
            $t('（1）站点后台操作方法：批量选择域名 > 批量停用（等待5-10分钟生效） > 再批量删除域名即可；'),
            $t('（2）域名商后台操作方法：将DNS改为域名商默认（如godaddy尊享版DNS）> 勾选域名+批量设置转发。'),
        ]
    },
    {
        title: $t('3.备用域名建议：'),
        content: [$t('即暂不启用的域名，建议先只添加到主域名，暂不进行解析，以免还没启用就被拦截、劫持、封锁或被墙；等需要使用的时候再添加到各功能模块使用即可。')]
    },
    {
        title: $t('4.收费说明(包含前台域名、后台域名、推广域名一起)：'),
        content: [
            $t('（1）域名解析：5 USDT/个 （前30免费，超过每新增一个额外收费）；'),
            $t('（2）流量收费：0.08 USDT/1GB (前500免费，超过每新增1G额外收费）；'),
            // $t('（3）节点收费：300 USDT/个 （免费提供3个，额外新增才开始收费）。'),
        ]
    },
]
</script>

<style lang="scss">
.explain-box {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    .small-box {
        line-height: 24px;
        margin-bottom: 10px;
        .title {
            font-size: 15px;
            font-weight: 600;
            color: #666;
        }
        .text {
            font-size: 14px;
            padding-left: 10px;
            color: #999;
        }
    }
}
</style>

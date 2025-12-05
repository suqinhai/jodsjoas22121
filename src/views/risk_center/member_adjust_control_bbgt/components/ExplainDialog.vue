<template>
    <!-- BBGT会员调控-说明 -->
    <Dialog width="880" :title="$t('温馨提示')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [10].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>

const emits = defineEmits(['close'])

const explainData = [
    { title: $t('注意：'), text: $t('此返奖率设置，只限于可控制厂家【指定】电子游戏的玩家；') },
    { title: $t('1、默认设置：'), text: $t('玩家第一次带资金进入游戏的返奖率，为会员初始设置，不包含推广账号；') },
    { title: $t('2、一键设置：'), text: $t('一键设置玩家的返奖率，修改初始配置，不包含推广账号；') },
    { title: $t('3、VIP人数比例配置：'), text: $t('对vip等级人数分配控制，将触发档位rtp，配置且需要勾选开启后生效；') },
    { title: $t('4、返奖率预设：'), text: $t('【代理设置 优先级第一】设置代理线的默认返奖率，可批量输入，用逗号隔开；【层级设置 优先级第二】设置层级的默认返奖率，【默认设置 优先级最低】，层级设置包括自动和固定层级，若会员同时存在则优先固定层级点控后，只会受一键设置的影响，一键设置可以把点控的用户改为一键设置的RTP，如果后续用户层级变动，则按用户层级的RTP；') },
    { title: $t('5、同步返奖率：'), text: $t('同步对应代理线或者会员层级的返奖率，如层级同步，上面的层级也对应同步，代理同步，上面的代理直属（不包括自己）也会同步；') },
    { title: $t('6、一键同步返奖率：'), text: $t('同步全部预设列表的返奖率，将检测预设列表对上面列表同步变化，预设的删除后，需要进行一键同步返奖率，才能更新返奖率；') },
    { title: $t('层级控制：'), text: $t('修改层级控制后将更新为最新的生效；') },
    { title: $t('代理控制：'), text: $t('只对代理发展的直属代理生效，不包括直属代理推广的其他代理；') },
    { title: $t('控制优先级：'), text: $t('范围控制（总台vip最大值限制）＞推广员（主播号）>点控>活动（余额救援金 > 控制签到）＞代理>固定层级>自动层级>vip等级人数触发>默认层级＞ 游戏默认RTP。') },
]
</script>

<style lang="scss">
.explain-box {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    .small-box {
        font-size: 16px;
        line-height: 24px;
        .label {
            color: #666;
        }
        .text {
            color: #999;
        }
        &--active {
            margin-top: 10px;
        }
    }
}
</style>

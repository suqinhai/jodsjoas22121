<template>
    <!-- 会员调控-说明 -->
    <Dialog width="880" :title="$t('温馨提示')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [10].includes(index)}" v-for="(item,index) in explainData2" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
// import { computed } from 'vue'
// import userStore from '@/store/user'

const emits = defineEmits(['close'])
const explainData1 = [
    { title: $t('层级控制配置'), text: '' },
    { title: '', text: $t('点击新增层级，选择可以新增的层级进行添加；') },
    { title: '', text: $t('如果层级设置里已经删除了该层级，则该层级控制列表也同时删除，控制也失效；') },
    { title: '', text: $t('根据会员所在层级（只可存在一个层级，如果配置固定就是固定层级），配置比例，默认无配置；') },
    { title: '', text: $t('会员进入控制游戏中，若层级发生改变（后台修改数值或会员自动升级），则需要在会员退出游戏后，进行改变；') },
    { title: '', text: $t('如：会员小玩家层级被拉入控制，游戏中层级变成大玩家，此时仍然按照小玩家的概率继续控制，当会员离开游戏后，再次进入则按照变更层级后的大玩家概率触发。') },

    { title: $t('新增会员控制'), text: '' },
    { title: '', text: $t('属于点控会员，输入会员ID，进行控制概率分配，输入控制金额，系统将根据触发金额后结束控制，若会员在游戏中，修改控制金额或概率，则无需退出游戏，可及时更变。') },

    { title: $t('VIP人数比例配置：'), text: $t('系统默认VIP等级控制关闭；') },
    // { title: $t('VIP自动化盈利控制分为：'), text: $t('人数比例配置控制（系统默认VIP等级控制关闭）；') },
    { title: $t('控制检测：'), text: $t('系统优先判断人数比例配置（VIP等级配置总和需要等于100%），再判断额度的配置；') },
    { title: '', text: $t('如：对人数比例配置，V1在50%返奖率配置20，120%返奖率配置80，则自动化检测V1等级的会员，进入控制游戏时，有20%的会员走50%返奖率，80%的会员走池子120%返奖率；') },

    { title: $t('推广账号配置：'), text: $t('对推广账号设置控制概率，只可配置高概率比例。') },

    { title: $t('控制优先级：'), text: $t('推广标签 > 点控 > 会员层级 > VIP等级池配置 > 默认配置（固定96%）。') },

    { title: $t('操作'), text: '' },
    { title: $t('结束控制：'), text: $t('操作后，玩家将在退出游戏时，结束后续控制，再次进入游戏后将重新匹配规则。') },
    // { title: $t('踢线并结束控制：'), text: $t('玩家在游戏中时，将玩家直接提出游戏‘网络异常，请重试’将玩家踢下线，重新进游戏则不可再被控制。') },
]
const explainData2 = [
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
// const userData = userStore()

// const showData = computed(() => {
//     return userData.siteInfo.ctrlMode ? explainData1 : explainData2
// })

// const specialData = computed(() => {
//     return userData.siteInfo.ctrlMode ? [6, 8, 11, 12, 13] : [8]
// })
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

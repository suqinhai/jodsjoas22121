<!--
 * @Date: 2023-11-15 16:04:34
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-01-12 12:07:44
-->
<template>
    <div class="guide-dialog-page">
        <div class="floatGuide" v-if="!visible" @click="visible = true">
            <el-icon>
                <Grid />
            </el-icon>
        </div>
        <el-dialog v-model="visible" modal-class="guide-dialog" :title="$t('请完成以下配置：')" top="10vh" :append-to-body="true">
            <div class="guide-dialog-box">
                <ul>
                    <li v-for="item in commons.guideList" :key="item.id">
                        <el-button v-throttle type="primary" :disabled="!!item.status" @click="goPage(item)">{{item.name}}
                        </el-button>
                        <span>{{item.status === 1?$t('已完成'):$t('未完成')}}</span>
                    </li>
                </ul>
                <div class="text">
                    <label>{{commons.guideCustomer.prompt}}：</label>
                    <span>{{commons.guideCustomer.phone}}</span>
                    <el-button v-throttle link type="primary" @click="copy">{{$t('复制')}}</el-button>
                </div>
                <div class="closeBtn">
                    <el-button v-throttle @click="visible = false">{{$t('关闭')}}</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { copyText } from '@/common/util/index'
import { useRouter } from 'vue-router'
import commonsStore from '@/store/common'
import { GUIDE_PATH } from '@/common/util/appConfig.js'

const commons = commonsStore()
const router = useRouter()
const visible = ref(false)

const copy = () => {
    copyText(commons.guideCustomer.phone)
}

const goPage = (item) => {
    router.push(GUIDE_PATH[item.id])
    visible.value = false
}

onMounted(() => {
    if (commons.guideFinished || !commons.alreadyRecharge) {
        visible.value = false
    } else {
        visible.value = true
    }
    globalVBus.$on('showGuide', () => {
        visible.value = true
    })
})
</script>

<style lang='scss'>
.guide-dialog-page {
    position: absolute;
    width: 0;
    height: 0;
    .floatGuide {
        position: fixed;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.25);
        border: 1px solid #ededed;
        border-radius: 8px;
        right: 10px;
        bottom: 20px;
        cursor: pointer;
        z-index: 9;
        .el-icon {
            width: 32px;
            // height: 32px;
            font-size: 32px;
        }
    }
}
.guide-dialog {
    .el-dialog {
        min-width: 660px;
    }
    &-box {
        padding: 20px 40px;
        ul {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-around;
            li {
                margin-right: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                &:last-of-type {
                    margin-right: 0;
                }
                .el-button {
                    margin-bottom: 10px;
                }
            }
        }
        .text {
            .el-button {
                margin-left: 10px;
            }
        }
        .closeBtn {
            margin: 20px auto 0;
            text-align: center;
            .el-button {
                min-width: 120px;
            }
        }
    }
}
</style>
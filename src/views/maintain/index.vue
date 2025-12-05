<template>
    <div class="maintain">
        <div class="maintain-main">
            <img src="../../assets/img/maintain.png" alt="">
            <div class="title">{{$t('当前站点正在维护')}}</div>
            <div class="tips">{{$t('如果您有任何疑问，请联系客服')}}</div>
        </div>
    </div>
</template>

<script setup>
    import { reactive, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { getConfigCheck } from '@/api/common'
    const router = useRouter()

    onMounted(()=> {
        getConfigCheck().then(res => {
            if (res && res.status !== 'maintain') router.push('/')
        })
    })
</script>

<style lang='scss' scoped>
.maintain {
    width: 100%;
    height: 100%;
    overflow: auto;

    &-main {
        // width: 100vw;
        // height: 100vh;
        min-width: 900px;
        min-height: 500px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-family: Microsoft YaHei;
        line-height: 75px;
        margin: auto;
        transform: translateY(50%);

        img {
            height: 286px;
            margin-bottom: 70px;
        }

        .title {
            font-size: 34px;
            color: #676767;
            text-align: center;
        }

        .tips {
            text-align: center;
            font-size: 30px;
            color: #949292;
        }
    }
}
</style>

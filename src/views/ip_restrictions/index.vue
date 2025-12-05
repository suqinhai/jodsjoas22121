<template>
    <div class="ip_restrictions">
        <div class="ip_restrictions-main">
            <img src="../../assets/img/restrictions.png" alt="">
            <div class="title">{{$t('您当前IP地址受到限制，无法浏览您所尝试打开网页。')}}</div>
            <div class="tips">{{$t('我们对您造成的不便表示万分歉意。')}}</div>
        </div>
    </div>
</template>

<script setup>
</script>

<style lang='scss' scoped>
.ip_restrictions {
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
            width: 447px;
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

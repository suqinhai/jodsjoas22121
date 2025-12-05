<template>
    <!-- 财务中心-人工加扣款-批量修正 -->
    <Dialog ref="dialog" width="400" :title="$t('批量修正')" top="10vh" :isShowSubmit="false" @cancel="cancel">
        <div class="batch-amend">
            <el-button v-throttle type="primary" @click="hanleBatchAmend">{{$t('文件上传')}}</el-button>
            <el-button v-throttle type="success" @click="handleDownload">{{$t('模板下载')}}</el-button>
        </div>
        <div class="batch-amend-tips">{{$t('仅限单站点用户操作')}}</div>
    </Dialog>
</template>

<script setup>
import { postBatchRevisionData } from '@/api/finance'
import * as XLSX from 'xlsx'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const emits = defineEmits(['close', 'fetchData', 'lookInfo'])
const dialog = ref(null)
let keyData = {
    userId: $t('会员ID'),
    tradeAmount: $t('交易金额'),
    tradeType: $t('交易类型'),
    auditFactor: $t('稽核倍数'),
    ticketId: $t('票券ID'),
    remark: $t('后端备注'),
    // pcRemark: $t('前端备注'),
}

const hanleBatchAmend = () => {
    let input = document.createElement('input')
    input.type = 'file'
    input.style.display = "none"
    document.body.appendChild(input)
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            let list = XLSX.utils.sheet_to_json(worksheet);
            list = list.filter(item => item[$t('会员ID')] && +item[$t('交易金额')])
            if (list && list.length) {
                if (list.length > 1000) return ElMessage.warning($t('单次最多导入1000条数据，请检查后重新操作！'))
                let params = []
                list.forEach(item => {
                    let obj = {}
                    for (let key in keyData) {
                        if (key === 'tradeType') {
                            obj.tradeType = +item[$t('交易类型')]
                        } else if (key === 'tradeAmount') {
                            obj.tradeAmount = +item[$t('交易金额')]
                        } else {
                            obj[key] = item[keyData[key]]
                        }
                    }
                    params.push(obj)
                })
                try {
                    dialog.value.closeLoading()
                    let res = await postBatchRevisionData({ params: JSON.stringify(params) })
                    ElMessageBox.confirm(res.data, $t('提示'), {
                        confirmButtonText: $t('查看导出结果'),
                        cancelButtonText: $t('关闭'),
                    }).then(() => {
                        emits('close')
                        emits('lookInfo')
                    }).catch(() => { })
                } catch (error) {
                    dialog.value.closeLoading()
                }
            } else {
                ElMessage.warning($t('此文件未获取到有效内容，请检查后重新操作！'))
            }
        };
        reader.onerror = (e) => {
            ElMessage.warning($t('文件内容获取失败，请重新操作！'))
        };
        reader.readAsArrayBuffer(file);
    }
    input.click()
    document.body.removeChild(input)
}

const handleDownload = () => {
    let a = document.createElement('a')
    a.download = $t('批量修正模版.xlsx')
    if($locale == 'en'){
        a.href = `/file/member_balance_amend_en.xlsx`
    }else if($locale == 'vi'){
        a.href = `/file/member_balance_amend_vi.xlsx`
    }else{
        a.href = `/file/member_balance_amend.xlsx`
    }
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const cancel = () => {
    emits('close')
    emits('fetchData')
}
</script>

<style lang="scss">
.batch-amend {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;

    &-tips {
        padding-left: 20px;
        margin-top: 10px;
        color: red;
    }
}
</style>

<template>
    <!-- 出款额度配置-新增配置 -->
    <Dialog ref="dialog" width="700" :title="$t('额度不足预警(注：若无配置则不预警)')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :model="form" :label-width="$locale == 'zh' ? '100px' : 'auto'" :rules="form.rules">
			<el-form-item :label="$t('预警额度：')" prop="warnBalance">
				<el-input-number class="special-input" v-model="form.warnBalance" :controls="false" :precision="0"
				    :min="0" :placeholder="$t('输入预警额度')" />
			</el-form-item>
			<el-form-item :label="$t('弹框内容：')" prop="warnMsg">
				<el-input v-model="form.warnMsg" type="textarea" :rows="4" :placeholder="$t('请输入弹框内容')" show-word-limit maxlength="500"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { getMetaData, postMetaData } from '@/api/common'


const addFrom = ref(null)
const emits = defineEmits(['close', 'refresh'])
const dialog = ref(null)
const form = reactive({
    warnMsg: '',
    warnBalance: '',
    type: 39,
	name: '',
	label: '',
	id: '',
	rules: {
		warnBalance: [{ required: true, message: $t('输入预警额度'), trigger: 'change' }],
		warnMsg: [{ required: true, message: $t('请输入弹框内容'), trigger: 'change' }],
	}
})


onMounted(() => {
    getData()
})

const getData = () => {
    dialog.value.showLoading()
    getMetaData({ type: 39 }).then(res => {
        let { data } = res
        if (data) {
            let obj = data[$t('代理商设置')]
            !!obj && (form.id = obj.id || '')
            if (obj && obj.value) {
                form.warnMsg = JSON.parse(obj.value).warnMsg || ''
				form.warnBalance = JSON.parse(obj.value).warnBalance || ''
				form.id = obj.id
				form.name = obj.name
				form.label = obj.label
            }
        }
        dialog.value.closeLoading()
    }).catch((err) => {
        dialog.value.closeLoading()
    })
}

const confirmEdit = (el) => {
	el.validate((valid, fields) => {
	    if (valid) {
			let { warnMsg, warnBalance } = form
			let data = {
				config: JSON.stringify({ warnMsg, warnBalance }),
				type: form.type,
			}
			if(form.id){
				data['id'] = form.id
				data['name'] = form.name
				data['label'] = form.label
			}
			postMetaData(data).then(res => {
				if (res.code === 0) {
					emits('close')
					emits('refresh')
				}
			})
		}else {
			ElMessage.warning($t('请完善表单内容再进行提交！'))
		}
	})
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
.red{
	color: red;
}
</style>
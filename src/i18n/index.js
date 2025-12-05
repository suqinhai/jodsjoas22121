import { createI18n } from 'vue-i18n'
import { LangEn } from './en';
import { LangZh } from './zh'
import { LangVi } from './vi'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('locale') || 'zh',
    warnHtmlMessage: false,
    messages:{
        'en': LangEn,
        'zh-Hans': LangZh,
        'zh': LangZh,
        'zh-CN': LangZh,
        'vi': LangVi,
    }
})

window.$t = i18n.global.t;
window.$locale = i18n.global.locale.value;

export default i18n
import {createI18n} from 'vue-i18n';

import en from './en.json';
import ka from './ka.json';

// Define the i18n configuration
const i18n = createI18n({
    locale: 'ka',
    fallbackLocale: 'ka',
    messages: {
        en,
        ka,
    },
});

export default i18n;
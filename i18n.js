import { I18n } from "i18n-js";
import {en} from './translations/en';
import {vi} from './translations/vi';
import {jp} from './translations/jp';

const i18n = new I18n();
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.translations = {en,vi,jp}
i18n.locale = 'en';

export default i18n

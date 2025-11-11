class I18n {
    constructor() {
        this.translations = null;
        this.currentLocale = 'lt';
    }

    async load(locale = 'lt') {
        try {
            const response = await fetch(`/locales/${locale}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.currentLocale = locale;
            return this.translations;
        } catch (error) {
            console.error(`Failed to load locale ${locale}:`, error);
            throw error;
        }
    }

    t(key) {
        if (!this.translations) {
            console.warn('Translations not loaded');
            return key;
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        return value;
    }
}

export const i18n = new I18n();

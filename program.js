class Security {
    constructor(document) {
        this.document = document;
        this.resultFields = document.querySelectorAll('#resultField');
        this.loadingField = document.querySelector('[data-action="loading"]');
        this.saveField = document.querySelector('[data-action="save-success"]');
        document.onclick = this.onClick.bind(this);
    }

    resultOutput() {
        const takeTextFromField = (fieldId) => {
            return this.resultFields[fieldId].innerText
                ? `${fieldId + 1}. ${this.resultFields[fieldId].innerText}`
                : `${fieldId + 1}. Тест не был проведен`;
        };

        return `Результаты проведенного тестирования антивируса и фаервола:\n${takeTextFromField(
            0
        )}\n${takeTextFromField(1)}\n${takeTextFromField(2)}\n${takeTextFromField(3)}\n${takeTextFromField(4)}\n`;
    }

    toggleLoading() {
        this.loadingField.classList.toggle('field--disabled');
    }

    async internet() {
        this.toggleLoading();

        const result = await window.myAPI.internet();

        this.resultFields[0].innerText = result.alive
            ? 'Данный компьютер подключен к интернету'
            : 'Данный компьютер не подключен к интернету';

        this.toggleLoading();
    }

    firewall() {
        this.toggleLoading();

        const result = window.myAPI.firewall();

        this.resultFields[1].innerText = result
            ? 'Фаервол Kaspersky Internet Security установлен'
            : 'Фаервол Kaspersky Internet Security не установлен';

        this.toggleLoading();
    }

    async isFirewallWork() {
        this.toggleLoading();

        const result = await window.myAPI.isFirewallWork();

        this.resultFields[2].innerText = result
            ? 'Межсетевой экран функционирует неверно или не функционирует вообще'
            : 'Межсетевой экран функицонирует верно';

        this.toggleLoading();
    }

    async antivirus() {
        this.toggleLoading();

        const result = await window.myAPI.antivirus();

        this.resultFields[3].innerText = result
            ? 'Антивирус Kaspersky установлен в системе'
            : 'Антивирус Kaspersky не установлен в системе';

        this.toggleLoading();
    }

    async isAntivirusWork() {
        this.toggleLoading();

        const result = await window.myAPI.isAntivirusWork();

        this.resultFields[4].innerText = result ? 'Антивирус Kaspersky работает' : 'Антивирус Kaspersky не работает';

        this.toggleLoading();
    }

    result() {
        this.resultFields[5].innerText = '';
        this.resultFields[5].innerText = this.resultOutput();
    }

    async saveInFile() {
        await window.myAPI.saveInFile(this.resultOutput());
        this.saveField.classList.remove('save--disabled');
    }

    onClick(e) {
        const action = e.target.dataset.action;

        if (action) {
            this[action]();
        }
    }
}

new Security(document);

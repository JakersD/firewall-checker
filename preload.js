//=== Подключение пакетов ===
const { contextBridge } = require('electron');
const ping = require('ping');
const http = require('http');
const fs = require('fs');
const regedit = require('regedit');
const ps = require('find-process');
const path = require('path');

//=== Конфиг для хранения сткроковой информации для функций ===

const config = {
    internetLink: 'www.google.com',
    blockedLink: 'http://yandex.ru',
    kasperskyFWPath: 'C:\\Program Files (x86)\\Kaspersky Lab\\Kaspersky Security Cloud 21.3\\knepsx64\\kneps.sys',
    kasperLabRegKey: 'HKLM\\SOFTWARE\\KasperskyLab',
    kasperCertsRegKey: 'HKLM\\SOFTWARE\\Microsoft\\SystemCertificates\\SPC\\Certificates',
};

//=== Функции для обработки запросов к ПК ===

const internet = async () => {
    try {
        return await ping.promise.probe(config.internetLink);
    } catch (error) {
        console.error('При проверке подключения к интернету произошла ошибка', e);
        return false;
    }
};

const firewall = () => fs.existsSync(config.kasperskyFWPath);

const isFirewallWork = async () => {
    const readUrl = (url) => {
        return new Promise((resolve, reject) => {
            http.get(url, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error());
                    res.resume();
                    return;
                }

                res.setEncoding('utf8');

                let rawData;
                res.on('data', (chunk) => (rawData += chunk));
                res.on('end', () => resolve(rawData));
            }).on('error', () => reject());
        });
    };

    return await readUrl(config.blockedLink)
        .then((data) => (data ? true : null))
        .catch(() => {
            return false;
        });
};

const antivirus = async () => {
    try {
        const { kasperLabRegKey, kasperCertsRegKey } = config;

        const registryList = await regedit.promisified.list([kasperLabRegKey, kasperCertsRegKey]);

        //Если существует папка LasperskyLab в SOFTWARE и сертификаты
        const isKasperLabRegKeyExist = registryList[kasperLabRegKey].exists;
        const isKasperCartsKeyExist = registryList[kasperCertsRegKey].exists;

        return isKasperLabRegKeyExist & isKasperCartsKeyExist ? true : false;
    } catch (error) {
        console.error('При проверке установленного на компьютере антивируса произошла ошибка', error);
        return false;
    }
};

const isAntivirusWork = async () => {
    return await ps('name', 'avp.exe')
        .then((list) => {
            return list[0] ? true : false;
        })
        .catch((error) => {
            console.error('При проверке работоспособности антивируса произошла ошибка', error);
        });
};

const saveInFile = (text) => {
    const pathToSave = path.resolve(__dirname, 'Результат.txt');
    try {
        if (fs.existsSync(pathToSave)) {
            fs.unlinkSync(pathToSave);
            return;
        }

        fs.writeFileSync(pathToSave, text, 'utf-8');
    } catch (error) {
        console.error('При сохранении в файл произошла ошибка', error);
    }
};

contextBridge.exposeInMainWorld('myAPI', {
    internet: internet,
    firewall: firewall,
    isFirewallWork: isFirewallWork,
    antivirus: antivirus,
    isAntivirusWork: isAntivirusWork,
    saveInFile: saveInFile,
});

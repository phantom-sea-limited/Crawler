var CryptoJS = require('crypto-js');
class Aes {
    constructor(key) {
        this.key = CryptoJS.enc.Utf8.parse(key);
    }
    encrypt(word) {
        var key = this.key;
        var srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.toString();
    }
    decrypt(word) {
        var key = this.key;
        var decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    }
}

i = new Aes("qwertyuiqwertyui")
en = i.encrypt("adwadbadjawdbwajdbjbasjdbwjadsadwadsawddddddddddaaaaaaaaaaaaaaaaaaaaaaaadwaxcccccccccccccccccccx")
out = i.decrypt(en)
console.log(en)
console.log(out)

// ==UserScript==
// @name         STV
// @namespace    Rcrwrate
// @version      2.1.5
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://sangtacviet.vip/*
// @match        https://sangtacviet.com/*
// @match        https://zh.nhimmeo.cf/book/*
// @match        https://wap.ciweimao.com/book/*
// @match        https://m.sfacg.com/*
// @match        https://www.qidian.com/book/*
// @icon         https://d.sirin.top/tmp_crop_decode.jpg
// @require      https://static.sirin.top/https://raw.githubusercontent.com/mickelsonmichael/js-snackbar/master/dist/js-snackbar.js
// @require      https://static.sirin.top/https://cdn.jsdelivr.net/gh/mozilla/localForage/dist/localforage.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @connect      book.sfacg.com
// @connect      mip.ciweimao.com
// @connect      wap.ciweimao.com
// @connect      www.linovel.net
// @connect      www.wenku8.net
// @connect      api.phantom-sea-limited.ltd
// @connect      speed.phantom-sea-limited.ltd
// @connect      dl.sirin.top
// @updateURL    https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/sangtacviet.user.js
// @downloadURL  https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/sangtacviet.user.js
// @license      MIT
// ==/UserScript==

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

class Article {
    ID;
    ori;
    bookname = null;
    cover = null;
    details = null;
    author = null;
    tag = null;
    chapterList = [];
    init_status = false;
    load_status = false;
    more = {};
    constructor(ID, ori, mode = "normal") {
        this.ID = ID;
        this.ori = ori
        this.mode = mode
        // this.load();
    }

    async init() {
        this.init_status = true
        await Task.add(
            [
                Task.createBymethod(this.ID, this.ori, "fetchInfo", this.mode),
                Task.createBymethod(this.ID, this.ori, "fetchCatalog", this.mode),
                Task.createBymethod(this.ID, this.ori, "translateCatalog", this.mode),
                Task.createBymethod(this.ID, this.ori, "translateInfo", this.mode),
                Task.createBymethod(this.ID, this.ori, "PrefetchChapter", this.mode),
                Task.createBymethod(this.ID, this.ori, "file", this.mode),
                `Cloud.UploadTask(${this.ID}, "${this.ori}", "${this.mode}")`
            ]
        )
        await this.save()
        setTimeout(Task.init, 200)
    }

    async reinit() {
        await this.load()
        if (this.init_status != true) {
            await Task.add(
                [
                    Task.createBymethod(this.ID, this.ori, "fetchInfo", this.mode),
                    Task.createBymethod(this.ID, this.ori, "fetchCatalog", this.mode),
                    Task.createBymethod(this.ID, this.ori, "translateCatalog", this.mode),
                    Task.createBymethod(this.ID, this.ori, "translateInfo", this.mode),
                    Task.createBymethod(this.ID, this.ori, "PrefetchChapter", this.mode),
                    Task.createBymethod(this.ID, this.ori, "file", this.mode),
                    `Cloud.UploadTask(${this.ID}, "${this.ori}", "${this.mode}")`
                ]
            )
            setTimeout(Task.init, 200)
        }
    }

    async fetchInfo() {
        await this.load()
        if (document.location.href == `${document.location.origin}/truyen/${this.ori}/1/${this.ID}/`) {
            this.details = ""
            this.author = bookinfo.author
            this.bookname = bookinfo.name
            this.book_uptime = bookinfo.lastupdate
            this.cover = bookinfo.thumb
            this.tag = ""
        } else {
            await Task.add(Task.createBymethod(this.ID, this.ori, "fetchInfo", this.mode), "push")
            window.Task_STOP = true
            document.location.href = `${document.location.origin}/truyen/${this.ori}/1/${this.ID}/`
        }
    }

    async fetchCatalog() {
        await this.load()
        if (document.location.href == `${document.location.origin}/truyen/${this.ori}/1/${this.ID}/`) {
            window.Task_STOP = true
            var r = await fetch(`${document.location.origin}/index.php?ngmar=chapterlist&h=${this.ori}&bookid=${this.ID}&sajax=getchapterlist&force=true`)
            r = await r.json()
            window.Task_STOP = false
            var log
            if (r.enckey) {
                log = localStorage.getItem("LOG")
            } else {
                log = r.oridata ?? r.data
            }
            if (log == null) {
                insert()
                window.Task_STOP = true
                await sleep(5000)
                await this.fetchCatalog()
                window.Task_STOP = false
            } else {
                // var oldchaperList = [...this.chapterList]
                // this.chapterList = []
                var chaps = log.split("-//-")
                var chaplist = {}
                chaps.forEach(chap => {
                    var chap = chap.split("-/-")
                    if (chap.length == 3) {
                        chaplist[chap[1]] = {
                            "name": chap[2],
                            "href": `${document.location.origin}/truyen/${this.ori}/1/${this.ID}/${chap[1]}/`,
                            "content": "",
                            "CanDownload": true
                        }
                    } else if (chap.length == 4) {
                        if (chap[3] == "unvip") { var CanDownload = true } else { var CanDownload = false }
                        chaplist[chap[1]] = {
                            "name": chap[2],
                            "href": `${document.location.origin}/truyen/${this.ori}/1/${this.ID}/${chap[1]}/`,
                            "content": "",
                            "CanDownload": CanDownload
                        }
                    } else {
                        window.notice.push(chap, Notice.ERROR)
                    }
                })
                this.chapterList[0] = chaplist
            }
        } else {
            await Task.add(Task.createBymethod(this.ID, this.ori, "fetchCatalog", this.mode), "push")
            window.Task_STOP = true
            document.location.href = `${document.location.origin}/truyen/${this.ori}/1/${this.ID}/`
        }
    }

    async translateCatalog() {
        await this.load()
        async function c(Article) {
            if (document.body.innerText.includes("书籍不存在或未审核通过")) {
                Article.more['c'] = "failed"
                await Article.save()
                await Article.translateCatalog()
            }
            if (document.location.href == `https://wap.ciweimao.com/book/${Article.ID}`) {
                var main = document.getElementsByClassName("cnt-inner")[0]
                var h2 = main.getElementsByTagName("h2")
                var ul = main.getElementsByTagName("ul")
                var i = 0
                // Article.chapterList = Article.chapterList.slice(0, 1)
                while (i < h2.length) {
                    if (Article.chapterList[i + 1] == undefined) {
                        Article.chapterList[i + 1] = { "name": h2[i].innerText, "lists": {} }
                    }
                    // var chap = { "name": h2[i].innerText, "lists": {} }
                    var j = 0
                    while (j < ul[i].children.length) {
                        var ID = ul[i].children[j].children[0].href.replace("https://wap.ciweimao.com/chapter/", "")
                        if (Article.chapterList[i + 1].lists[ID] == undefined) {
                            Article.chapterList[i + 1].lists[ID] = Article.chapterList[0][ID]
                            Article.chapterList[i + 1].lists[ID]["name"] = ul[i].children[j].innerText
                        }
                        j++
                    }
                    i++
                    // Article.chapterList.push(chap)
                }
            } else {
                await Task.add(Task.createBymethod(Article.ID, Article.ori, "translateCatalog", Article.mode), "push")
                window.Task_STOP = true
                document.location.href = `https://wap.ciweimao.com/book/${Article.ID}`
            }
        }
        async function c2(Article) {
            if (document.location.href == `https://zh.nhimmeo.cf/book/${Article.ID}/catalog/`) {
                var all = document.getElementsByClassName("collapsible")
                var i = 0
                // Article.chapterList = Article.chapterList.slice(0, 1)
                while (i < all.length) {
                    if (Article.chapterList[i + 1] == undefined) {
                        Article.chapterList[i + 1] = { "name": all[i].innerText.split("\n")[1], "lists": {} }
                    }
                    // var catalog = { "name": all[i].innerText.split("\n")[1], "lists": {} }
                    var chaplist = all[i].nextElementSibling.getElementsByClassName("chapter_info")
                    var j = 0
                    while (j < chaplist.length) {
                        var downloadstate = false
                        var ID = chaplist[j].nextElementSibling.nextElementSibling.childNodes[0].href.split('/').pop()
                        if (Article.chapterList[i + 1].lists[ID] == undefined) {
                            Article.chapterList[i + 1].lists[ID] = Article.chapterList[0][ID]
                            Article.chapterList[i + 1].lists[ID]["name"] = chaplist[j].nextElementSibling.nextElementSibling.innerText
                        }
                        // catalog.lists[ID] = Article.chapterList[0][ID]
                        // catalog.lists[ID]['name'] = chaplist[j].nextElementSibling.nextElementSibling.innerText
                        j += 1
                    }
                    // Article.chapterList.push(catalog)
                    i += 1
                }
            } else {
                await Task.add(Task.createBymethod(Article.ID, Article.ori, "translateCatalog", Article.mode), "push")
                window.Task_STOP = true
                document.location.href = `https://zh.nhimmeo.cf/book/${Article.ID}/catalog/`
            }
        }
        async function sf(Article) {
            if (document.location.href == `https://m.sfacg.com/i/${Article.ID}/`) {
                var all = document.getElementsByClassName("mulu")
                for (let i = 0; i < all.length; i++) {
                    var chaptitle = all[i];
                    if (Article.chapterList[i + 1] == undefined) { Article.chapterList[i + 1] = { lists: {} } }
                    Article.chapterList[i + 1].name = chaptitle.innerText
                    var chaps = chaptitle.nextElementSibling.children[0].children
                    for (let j = 0; j < chaps.length; j++) {
                        const chap = chaps[j];
                        var ID = chap.href.split("/")[4]
                        if (Article.chapterList[i + 1]['lists'][ID] == undefined) { Article.chapterList[i + 1]['lists'][ID] = Article.chapterList[0][ID] }
                        Article.chapterList[i + 1]['lists'][ID].name = chap.innerText
                    }
                }
            } else {
                await Task.add(Task.createBymethod(Article.ID, Article.ori, "translateCatalog", Article.mode), "push")
                window.Task_STOP = true
                document.location.href = `https://m.sfacg.com/i/${Article.ID}/`
            }
        }
        async function fallback(Article) {
            var all = Object.keys(Article.chapterList[0])
            if (Article.chapterList[1] == undefined) { Article.chapterList[1] = { name: "默认", lists: {} } }
            all.forEach((ID) => {
                if (Article.chapterList[1]['lists'][ID] == undefined) { Article.chapterList[1]['lists'][ID] = Article.chapterList[0][ID] }
            })
        }

        if (this.ori == "ciweimao" && this.more['c'] == undefined) { await c(this) }
        else if (this.ori == "ciweimao") { await c2(this) }
        else if (this.ori == "sfacg") { await sf(this) }
        else if (this.ori == "qidian") { await this.qidian() }
        else { await fallback(this) }
    }

    async qidian() {
        if (document.location.href == `https://www.qidian.com/book/${this.ID}/`) {
            const all = document.querySelectorAll(".catalog-volume")
            for (let i = 0; i < all.length; i++) {
                const html = all[i]
                const title = html.querySelector(".volume-name").innerText.split("·")[0]

                const chaplist = this.chapterList[i + 1] ?? {
                    name: title,
                    lists: {}
                }

                const chaps = html.querySelectorAll("a.chapter-name")
                for (let id = 0; id < chaps.length; id++) {
                    const chap = chaps[id]
                    const chapid = chap.href.split("/")[5]
                    const title = chap.innerText
                    if (chaplist.lists[id] && chaplist.lists[id].name === title) {

                    } else {
                        chaplist.lists[id] = this.chapterList[0][chapid]
                        chaplist.lists[id].name = title
                    }
                }
                this.chapterList[i + 1] = chaplist
            }
            await this.save()
        } else {
            await Task.add(Task.createBymethod(this.ID, this.ori, "translateCatalog", this.mode), "push")
            window.Task_STOP = true
            window.open(`https://www.qidian.com/book/${this.ID}/`);
            unsafeWindow.location.href = 'about:blank';
            unsafeWindow.close();
            //document.location.href = `https://www.qidian.com/book/${this.ID}/`

        }
    }

    async translateInfo() {
        await this.load()
        async function c(Article) {
            if (document.location.href == `https://wap.ciweimao.com/book/${Article.ID}`) {
                Article.details = document.getElementsByClassName("desc-cnt")[0].innerText
                Article.tag = document.getElementsByClassName("cnt-inner")[1].innerText
            } else {
                await Task.add(Task.createBymethod(Article.ID, Article.ori, "translateInfo", Article.mode), "push")
                window.Task_STOP = true
                document.location.href = `https://wap.ciweimao.com/book/${Article.ID}`
            }
        }

        async function sf(Article) {
            if (document.location.href == `https://m.sfacg.com/b/${Article.ID}/`) {
                Article.details = document.getElementsByClassName("book_profile")[0].innerText
            } else {
                await Task.add(Task.createBymethod(Article.ID, Article.ori, "translateInfo", Article.mode), "push")
                window.Task_STOP = true
                document.location.href = `https://m.sfacg.com/b/${Article.ID}/`
            }
        }
        if (this.ori == "ciweimao") { await c(this) }
        else if (this.ori == "sfacg") { await sf(this) }
    }

    async fetchChapter(i, j) {
        await this.load()
        var chap = this.chapterList[i].lists[j]
        var content = document.getElementsByClassName("contentbox")[1]
        if (document.location.href == chap.href) {
            if (chapterfetcher.responseText != "" && content.innerHTML.contain("function()") == false) {
                content.children[0].remove()
                if (document.location.hostname == "sangtacviet.com") {
                    FIX_CN()
                } else { }
                chap.content = content.innerHTML.replaceAll("<br>", "\n")
            } else {
                window.Task_STOP = true
                await sleep(1000)
                await this.fetchChapter(i, j)
                window.Task_STOP = false
            }
        } else {
            await Task.add(Task.create(this.ID, this.ori, [`await A.fetchChapter(${i},${j})`], this.mode), "push")
            window.Task_STOP = true
            document.location.href = chap.href
        }
    }

    async PrefetchChapter() {
        await this.load()
        if (this.chapterList != null) {
            var tasklists = []
            var i = 1
            this.chapterList.slice(1).forEach(chap => {
                for (let k in chap.lists) {
                    var chapinfo = chap.lists[k]
                    if (chapinfo['CanDownload'] != false && (chapinfo["content"] == "" || chapinfo["content"].includes("function()"))) {
                        tasklists.unshift(Task.create(this.ID, this.ori, [`await A.fetchChapter(${i},${k})`], this.mode))
                    }
                }
                i++
            })
            if (tasklists.length != 0) {
                tasklists.unshift(Task.createBymethod(this.ID, this.ori, "PrefetchChapter", this.mode))
            }
            await Task.add(tasklists, "push")
        }
    }

    output() {
        return {
            'ori': this.ori,
            'bookname': this.bookname,
            'cover': this.cover,
            'book_uptime': this.book_uptime,
            'details': this.details,
            'author': this.author,
            'tag': this.tag,
            'chapterList': this.chapterList,
            'more': this.more
        }
    }

    async file() {
        await this.load()
        let link = document.createElement('a');
        link.download = `${this.bookname}.json`;
        let blob = new Blob([JSON.stringify(this.output())], { type: 'text/json' });
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    async load() {
        if (this.load_status != true) {
            if (this.mode == "normal") {
                var tmp = Article.localconfig(this.ID);
            } else if (this.mode == "async") {
                var tmp = await Article.localforge(this.ID)
                if (tmp == null) { tmp = Article.localconfig(this.ID) }
                if (tmp == null) { tmp = Article.GM_config(this.ID) }
            } else {
                var tmp = await Article.GM_config(this.ID)
                if (tmp == null) { tmp = Article.localconfig(this.ID) }
                if (tmp == null) { tmp = await Article.localforge(this.ID) }
            }

            if (tmp != null) {
                this.ori = tmp.ori;
                this.bookname = tmp.bookname;
                this.details = tmp.details;
                this.author = tmp.author;
                this.tag = tmp.tag
                this.chapterList = tmp.chapterList;
                this.cover = tmp.cover;
                this.book_uptime = tmp.book_uptime;
                this.more = tmp.more
            } else {
                await this.init()
            }
            this.load_status = true
        }
    }

    async save() {
        if (this.mode == "normal") {
            Article.localconfig(this.ID, this.output())
        } else if (this.mode == "async") {
            await Article.localforge(this.ID, this.output())
        } else {
            await Article.GM_config(this.ID, this.output())
        }
    }

    static localconfig(key, msg = '') {
        if (msg === '') {
            return JSON.parse(localStorage.getItem(key));
        } else {
            return localStorage.setItem(key, JSON.stringify(msg))
        }
    }

    static async localforge(key, msg = "") {
        var localforge = window.localforage
        if (msg === "") {
            return JSON.parse(await localforge.getItem(key))
        } else {
            return await localforge.setItem(key, JSON.stringify(msg))
        }
    }

    static async GM_config(key, msg = "") {
        if (msg === "") {
            var tmp = await GM.getValue(key);
            if (tmp == undefined) { tmp = null }
            return JSON.parse(tmp)
        } else {
            return await GM.setValue(key, JSON.stringify(msg))
        }
    }
}


window.Task_STOP = false
class Task {
    static createBymethod(ID, ori, method, mode = "normal") {
        return `
            var A = new Article(${ID},\"${ori}\",\"${mode}\")
            A.${method}().then(res=>{A.save()})`
    }

    static create(ID, ori, lines, mode = "normal") {
        function _(lines) {
            var command = ""
            lines.forEach(element => {
                command += element + "\n"
            })
            return command
        }
        return `
            var A = new Article(${ID},\"${ori}\",\"${mode}\")
            async function _(){
                ${_(lines)}
            }
            _().then(res=>{A.save()})`
    }


    static async add(command, mode = "unshift") {
        var commands = window.Task_info
        if (commands == null) { commands = [] }
        if (typeof (command) == 'object') {
            command.forEach(element => {
                if (mode == "unshift") { commands.unshift(element) } else { commands.push(element) }
            })
        } else {
            if (mode == "unshift") { commands.unshift(command) } else { commands.push(command) }
        }
        await Task.localconfig(commands)
    }

    static async init() {
        window.Task_info = await Task.localconfig()
        var commands = window.Task_info
        var command;
        if (commands != null) {
            if (commands.length != 0) {
                if (window.Task_STOP != true) {
                    command = commands.pop()
                    eval(command)
                    window.notice.push(command, Notice.DEBUG)
                    await Task.localconfig(commands)
                }
                setTimeout(Task.init, 1000)
            }
        }
        window.notice.push("Task finish! waiting for another", Notice.DEBUG)
    }

    static async localconfig(msg = '') {
        return await Article.GM_config("Task", msg)
    }
}
window.Task_info = await Task.localconfig()
window.Task_statu = null


class Notice {
    static DEBUG = 0
    static INFO = 10
    static WARNING = 20
    static ERROR = 30
    static Critical = 40
    static NoLog = 50
    static console = "C"
    static GM_log = "G"
    static snackbar = "S"
    c_tr = { 0: "debug", 10: "info", 20: "warn", 30: "error", 40: "error" }
    g_tr = { 0: "[DEBUG]", 10: "[INFO]", 20: "[WARN]", 30: "[ERROR]", 40: "[Critical]" }
    s_tr = { 0: "info", 10: "green", 20: "warning", 30: "danger", 40: "danger" }

    constructor(loglevel = Notice.INFO, method = [Notice.GM_log, Notice.console, Notice.snackbar]) {
        this.loglevel = loglevel
        this.method = method
    }

    push(msg, level) {
        if (level >= this.loglevel) {
            this.method.forEach((e) => {
                this[e](msg, level)
            })
        }
    }

    G(msg, level) {
        GM_log(`${this.g_tr[level]}\t${msg}`)
    }

    C(msg, level) {
        console[this.c_tr[level]](msg)
    }

    S(msg, level) {
        // $.snackbar({
        //     content: msg, // text of the snackbar
        //     style: `toast ${this.s_tr[level]}`, // add a custom class to your snackbar
        //     timeout: 1000 // time in milliseconds after the snackbar autohides, 0 is disabled
        // })
        window.SnackBar({
            message: msg,
            status: this.s_tr[level],
            fixed: true
        })
    }
}
window.Notice = Notice
window.notice = new Notice(Notice.INFO, [Notice.snackbar, Notice.GM_log])
window.SnackBar = SnackBar

const Cloud = {
    chunkSize: 5 * 1024 * 1024,    // 5MB 切片大小，根据需要进行调整
    init: false,
    gtoken: undefined,
    uploadSessionUrl: undefined,

    file: (Article) => {
        const jsonString = JSON.stringify(Article.output());
        return new Blob([jsonString], { type: 'application/json' });
    },

    UploadTask: (ID, ori, mode) => {
        install(function recaptcha_init_Callback() { grecaptcha.execute() })
        Task.add(`Cloud.upload(${ID}, "${ori}", "${mode}")`)
        Cloud.recaptcha_init()
        window.Task_STOP = true
        window.notice.push("正在将结果上传至云端,用于分享给其他用户,感谢您的慷慨", Notice.INFO)
    },

    recaptcha_init: () => {
        if (!Cloud.init) {
            function recaptcha_callback(e) {
                STV.notice.push("人机验证成功!正在上传文件", STV.Notice.INFO)
                STV.Cloud.gtoken = e
                STV.Task_STOP = false
                STV.Task.init()
            }
            var key = document.createElement("div")
            key.dataset["sitekey"] = "6LdwBqEnAAAAAFW5q1vRrjxoy2igf4h0knhkChSI"
            key.dataset["size"] = "invisible"
            key.dataset['callback'] = "recaptcha_callback"
            key.classList.add("g-recaptcha")
            document.body.append(key)
            install(recaptcha_callback)
            var js = document.createElement('script')
            js.src = "https://www.recaptcha.net/recaptcha/api.js?onload=recaptcha_init_Callback"
            document.body.append(js)
            Cloud.init = true
        }
    },

    upload: (ID, ori, mode = "GM") => {
        A = new Article(ID, ori, mode)
        A.load().then(() => { Cloud.createUploadSession(A) })
    },

    createUploadSession: (Article) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.sirin.top/release/Cloud/upload?gtoken=${Cloud.gtoken}&id=${Article.ID}&source=${Article.ori}`,
            headers: {
                "Accept": "text/json"
            },
            onload: function (response) {
                window.notice.push(response.responseText, Notice.DEBUG)
                if (response.status == 200) {
                    r = JSON.parse(response.responseText)
                    Cloud.uploadChunks(r.uploadUrl, Article, Cloud.chunkSize)
                }
            }
        });
    },

    fetchlatest: (ID, ori) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.sirin.top/release/Cloud/v1/Sangtacviet/download?id=${ID}&source=${ori}`,
            headers: {
                "Accept": "text/json"
            },
            onload: function (response) {
                window.notice.push(response.responseText, Notice.DEBUG)
                if (response.status == 200) {
                    r = JSON.parse(response.responseText)
                    if (r['@microsoft.graph.downloadUrl']) {
                        window.notice.push("已找到到云端数据,正在下载", Notice.INFO)
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: r['@microsoft.graph.downloadUrl'],
                            onload: function (response) {
                                if (response.status == 200) {
                                    GM.setValue(ID, response.response)
                                    window.notice.push("下载成功，已自动导入", Notice.INFO)
                                } else {
                                    window.notice.push("下载失败，请稍后重试", Notice.INFO)
                                }
                            }
                        });
                    } else {
                        window.notice.push("未找到云端数据", Notice.ERROR)
                    }
                }
            }
        });
    },

    // 将文件切片成指定大小的块
    sliceFile: (file, chunkSize) => {
        const slices = [];
        let start = 0;
        while (start < file.size) {
            slices.push(file.slice(start, start + chunkSize));
            start += chunkSize;
        }
        return slices;
    },

    // 开始上传切片
    uploadChunks: (uploadSessionUrl, Article, chunkSize) => {
        var file = Cloud.file(Article)
        const slices = Cloud.sliceFile(file, chunkSize);
        let index = 0;

        function uploadNextChunk() {
            if (index >= slices.length) {
                window.notice.push('文件上传完成,感谢您的慷慨', Notice.INFO);
                return;
            }

            const currentChunk = slices[index];
            const chunkStart = index * chunkSize;
            const chunkEnd = chunkStart + currentChunk.size - 1;

            const headers = {
                'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${file.size}`,
                'Content-Length': currentChunk.size,
            };

            fetch(uploadSessionUrl, {
                method: 'PUT',
                headers,
                body: currentChunk,
            })
                .then(response => {
                    if (!response.ok) {
                        window.notice.push(`Chunk upload failed: ${response.status} ${response.statusText}`, Notice.ERROR);
                        throw new Error(`Chunk upload failed: ${response.status} ${response.statusText}`);
                    }
                    window.notice.push(`Uploaded chunk ${index + 1}/${slices.length}`, Notice.DEBUG);
                    index++;
                    uploadNextChunk();
                })
                .catch(error => {
                    window.notice.push(`Chunk upload failed: ${error}`, Notice.ERROR);
                });
        }
        uploadNextChunk();
    }
}
window.Cloud = Cloud

// INIT
setTimeout(check)
function check() {
    window.notice.push("Start checking!", Notice.DEBUG)
    try {
        if (document.location.hostname == "sangtacviet.vip" || document.location.hostname == "sangtacviet.com") {
            if (document.body.innerText.contain("检查站点连接是否安全")) {
                setTimeout(check, 2000)
            } else if (document.body.innerText.includes("Error code")) {
                document.location.href = document.location.href
            } else {
                run()
            }
        } else if (document.location.hostname == "wap.ciweimao.com") {
            if (document.body.innerText.search("检查站点连接是否安全") != -1 || document.body.innerText.search("Error code") != -1) {
                setTimeout(check, 2000)
            } else {
                run()
            }
        } else if (document.location.hostname == "zh.nhimmeo.cf") {
            run()
        } else if (document.location.hostname == "m.sfacg.com") {
            run()
        } else if (document.location.hostname == "www.qidian.com") {
            if (document.body.innerHTML.length <= 50) {
                setTimeout(check, 2000)
            } else {
                run()
            }
        }
    } catch {
        setTimeout(check, 2000)
    }
}

function run() {
    var exp = new Date();
    exp.setTime(exp.getTime() + 1 * 24 * 60 * 60 * 1000 * 365);
    document.cookie = 'transmode=chinese	 ;path=/ ;expires=' + exp.toGMTString();
    window.notice.push("Start running!", Notice.DEBUG)

    // var IDs = document.location.href.match(/\/(ciweimao|sfacg)\/\d+\/(\d+)\/$/)
    // window.IDs = IDs
    window.IDs = unsafeWindow.bookinfo
    setTimeout(add_button)
    setTimeout(insert)
    setTimeout(Task.init)
    setTimeout(add_task_status)
    setTimeout(search.init)
    setTimeout(search_helper)
    setTimeout(search_first)
    setTimeout(details_helper)
    if (IDs) { setTimeout(Cloud.recaptcha_init) }
}

//insert JS into Page
function install(func) {
    var s = document.createElement("script")
    s.type = "text/javascript"
    s.innerHTML = func.toString()
    document.body.append(s)
}

function insert() {
    // function EX(a, b, c, d = null) {
    //     window.STV = {}
    //     window.STV.Article = a
    //     window.STV.Task = b
    //     window.STV.window = c
    //     window.a = d
    // }
    function decryptAes(encrypted, key, iv) {
        encrypted = CryptoJS.enc.Base64.parse(encrypted);
        key = CryptoJS.enc.Utf8.parse(key);
        iv = CryptoJS.enc.Utf8.parse(iv);
        var decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, { iv: iv });
        var out = decrypted.toString(CryptoJS.enc.Utf8);
        localStorage.setItem("LOG", out)
        return out
    }
    if (IDs != null) {
        localStorage.setItem("LOG", null)
        install(decryptAes)
        renewchapter()
    }

    //  旧代码，暴力注入
    // install(EX)
    // force()
    window.Article = Article
    window.Task = Task
    unsafeWindow.STV = window
}

// function force() {
//     var force = create("测试", "fa fa-certificate", function () {
//         EX(Article, Task, window)
//     })
//     force.style.display = "none"
//     document.body.append(force)
//     force.click()
// }

//Message PART
function title() {
    return document.getElementById("book_name2")
}

setTimeout(insertCSS)
function insertCSS() {
    if (document.body != undefined) {
        var css = document.createElement("link")
        css.rel = 'stylesheet'
        css.href = "https://static.sirin.top/https://raw.githubusercontent.com/mickelsonmichael/js-snackbar/master/dist/js-snackbar.css"
        document.body.append(css)
        css = document.createElement("style")
        css.innerHTML = `
        .blue {
        background-color: #479ad0;
        }
        .grey {
            background-color: #878787;
        }
        .warn {
            background-color: #7350af;
        }
        .error {
            background-color: #d50a0a;
        }
        `
        document.body.append(css)
    } else {
        setTimeout(insertCSS)
    }
}

//ADD BUTTON
function create(info, icon, func) {
    var d = document.createElement("div")
    d.classList.add("col-lg-2")
    d.classList.add("col-3")
    d.innerHTML = `<span class="blk-item"><i class="${icon}"></i>${info}</span>`
    d.onclick = func
    return d
}

function add_button() {
    var main
    var css = document.createElement("link")
    css.rel = 'stylesheet'
    css.href = "https://static.sirin.top/https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    document.body.append(css)

    if (IDs != null) {
        main = document.getElementsByClassName("row justify-content-md-center")[0]
        main.innerHTML = ""
        main.append(create("下载", "fa fa-download", function () {
            var A = new Article(IDs.id, IDs.host, "GM")
            A.load().then(res => { A.reinit().then(() => { Task.init() }) })
        }))
        main.append(create("修复下载", "fa fa-download", function () {
            var A = new Article(IDs.id, IDs.host, "GM")
            A.PrefetchChapter().then(res => { Task.init() })
        }))
        main.append(create("手动导出", "fa fa-floppy-o", function () {
            var A = new Article(IDs.id, IDs.host, "GM")
            A.load().then(res => { A.file() })
        }))
        main.append(create("清除缓存", "fa fa-times", function () {
            GM.deleteValue(IDs.id);
            window.notice.push("缓存已清除!", Notice.INFO)
        }))
        main.append(create("清除所有缓存", "fa fa-times", async function () {
            const asyncKeys = await GM.listValues();
            asyncKeys.forEach(key => {
                if (key != "Task") {
                    GM_deleteValue(key)
                }
            })
            window.notice.push("所有缓存已清除!", Notice.INFO)
        }))
        main.append(create("注入", "fa fa-certificate", function () {
            var A = new Article(IDs.id, IDs.host, "GM")
            A.load().then(res => {
                window.A = A
            })
            window.notice.push("注入已执行!", Notice.WARNING)
        }))
        main.append(create("前往云端(临时)", "fa fa-cloud", function () {
            // if (Cloud.gtoken) { unsafeWindow.grecaptcha.reset() }
            // unsafeWindow.grecaptcha.execute()
            var url = "https://api.phantom-sea-limited.ltd/release/API/get?id=01T4VX664MN4UKD43BSZC3YZOSFZTLPHDC"
            window.open('javascript:window.name;', '<script>location.replace("' + url + '")<\/script>');
        }))
        main.append(create("上传至云端", "fa fa-cloud-upload", function () {
            if (Cloud.gtoken) { unsafeWindow.grecaptcha.reset() }
            unsafeWindow.grecaptcha.execute()
            Task.add(`Cloud.upload(${IDs.id}, "${IDs.host}")`)
        }))
        main.append(create("下载云端最新文件", "fa fa-cloud-download", function () {
            // window.notice.push("尚未完工", Notice.ERROR)
            Cloud.fetchlatest(IDs.id, IDs.host)
        }))
        // main.append(create("测试", "fa fa-certificate", async function () {
        //     const asyncKeys = await GM.listValues();
        //     asyncKeys.forEach(key => {
        //         if (key != "Task") {
        //             GM.deleteValue(key)
        //         }
        //     })
        //     title().innerText = "测试已执行"
        // }))
    } else {
        // main = document.getElementById("tm-nav-search-logo").parentElement
        // main = document.getElementById("tm-nav-search-top-right")
        main = document.getElementsByClassName("input-group")[0]
        main.append(create("终止任务", "fa fa-times", function () {
            window.Task_STOP = true
            window.Task_info = []
            Task.localconfig([])
            window.notice.push("任务已终止!", Notice.WARNING)
        }))
        main.append(create("汉化工具", "fa fa-lightbulb-o", function () {
            FIX_CN()
        }))
    }
}

async function add_task_status() {
    var l = window.Task_info
    var msg
    if (l == null) { msg = "任务已完成" }
    else if (l.length != 0) { msg = `任务剩余${l.length}` }
    else { msg = "任务已完成" }
    window.notice.push(msg, Notice.INFO)
    if (msg != "任务已完成") {
        setTimeout(add_task_status, 2000)
    }
}

//Helper
async function search_helper() {
    if (document.location.pathname === "/") {
        var js = document.createElement("script")
        js.innerHTML = `function doquery(isnew){
            createquery(isnew);
            //location="/"+query;
            ui.swiftload("/"+query,"searchbutton");
            ui.scrollto("searchbutton",50);
            setTimeout(window.STV.search_helper_handler, 2000)
        }`
        document.body.append(js)
    }
}

function search_first() {
    if (document.location.pathname === "/" || document.location.pathname === "/search/") {
        setTimeout(search_helper_handler, 2000)
    }
}

const search = {
    init: () => Article.GM_config("Helper").then((r) => {
        if (r != null) { search.data = r }
    }),
    data: {
        sfacg: {},
        ciweimao: {},
        linovel: {},
        wenku8: {}
    },
    ciweimao: (ID, dom) => {
        if (search.data.ciweimao[ID] == undefined) {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://mip.ciweimao.com/book/${ID}`,
                headers: {
                    "Accept": "text/html"
                },
                onload: function (response) {
                    if (response.status == 200) {
                        var n = response.responseText.match(/<span class="book-name">(.*)<\/span>/)[1]
                        window.notice.push(n, Notice.DEBUG);
                        dom.innerText = n
                        search.data.ciweimao[ID] = n
                        Article.GM_config("Helper", search.data)
                    }
                }
            });
        } else {
            dom.innerText = search.data.ciweimao[ID]
        }
    },
    sfacg: (ID, dom) => {
        if (search.data.sfacg[ID] == undefined) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://book.sfacg.com/ajax/ashx/Common.ashx?op=ticketinfo",
                data: `nid=${ID}`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                onload: function (response) {
                    var r = JSON.parse(response.responseText)
                    if (r.status == 200) {
                        dom.innerText = r.tickets.NovelName
                        search.data.sfacg[ID] = r.tickets.NovelName
                        Article.GM_config("Helper", search.data)
                    }
                    window.notice.push(r, Notice.DEBUG);
                }
            });
        } else {
            dom.innerText = search.data.sfacg[ID]
        }
    },
    linovel: (ID, dom) => {
        if (search.data.linovel[ID] == undefined) {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://www.linovel.net/book/${ID}.html`,
                headers: {
                    "Accept": "text/html"
                },
                onload: function (response) {
                    if (response.status == 200) {
                        var n = response.responseText.match(/<meta property="og:title" content="(.*)" \/>/)[1]
                        window.notice.push(n, Notice.DEBUG);
                        dom.innerText = n
                        search.data.linovel[ID] = n
                        Article.GM_config("Helper", search.data)
                    }
                }
            });
        } else {
            dom.innerText = search.data.linovel[ID]
        }
    },
    wenku8: (ID, dom) => {
        if (search.data.wenku8[ID] == undefined) {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://www.wenku8.net/book/${ID}.htm`,
                headers: {
                    "Accept": "text/html"
                },
                responseType: "arraybuffer",
                onload: function (response) {
                    if (response.status == 200) {
                        var x = new Uint8Array(response.response);
                        var str = new TextDecoder('gbk').decode(x)
                        var n = str.match(/<b>《(.*)》/)[1]
                        window.notice.push(n, Notice.DEBUG);
                        dom.innerText = n
                        search.data.wenku8[ID] = n
                        Article.GM_config("Helper", search.data)
                    }
                }
            });
        } else {
            dom.innerText = search.data.wenku8[ID]
        }
    },
    default: (dom) => {
        var key = dom.href.match(/\/(ciweimao|sfacg|linovel|wenku8)\/\d+\/(\d+)\/$/)
        if (key) {
            search[key[1]](key[2], dom.children[1].children[0])
        }
    }
}

window.search = search
window.search_helper_handler = search_helper_handler
window.details_helper = details_helper

async function search_helper_handler() {
    window.notice.push("Search Helper running", Notice.DEBUG)
    var books = document.getElementsByClassName("booksearch")
    for (let i = 0; i < books.length; i++) {
        search.default(books[i])
    }
    setTimeout(search_helper, 1000)
}

function details_helper() {
    // if (IDs != null) {
    //     search[IDs[1]](IDs[2], title())
    //     window.notice.push("Detail Helper running", Notice.DEBUG)
    // }
    if (unsafeWindow.bookinfo != undefined) {
        title().innerText = unsafeWindow.bookinfo.name
    }
}

GM_registerMenuCommand("终止任务", () => {
    window.Task_STOP = true
    window.Task_info = []
    Task.localconfig([])
})

function FIX_CN() {
    if (document.location.hostname !== "sangtacviet.com") {
        window.notice.push("你需要在sangtacviet.com下使用本功能", Notice.WARNING)
        return
    }
    const all = Array.from(document.querySelectorAll("i"))
    for (const i of all) {
        if (i.className === "") {
            try {
                i.replaceWith(i.cn)
            } catch { }
        }
    }
    const content = document.getElementsByClassName("contentbox")[1]

    for (const ad of content.querySelectorAll(".ad_content")) {
        ad.remove()
    }
    content.children[0].remove()
    content.innerHTML = content.innerHTML.replaceAll(" ", "").replace("由于版权问题，本源不支持查看原文。", "")
        .replaceAll(",", "，").replaceAll(".", "。").replaceAll("?", "？").replaceAll(":", "：").replaceAll("!", "！")
        .replaceAll("Vìvấnđềnộidung，nguồnnàykhônghỗtrợxemvănbảngốc。", "")
}

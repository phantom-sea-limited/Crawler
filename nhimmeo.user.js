// ==UserScript==
// @name         nhimmeo下载工具
// @namespace    Rcrwrate
// @version      2.3.2
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://zh.nhimmeo.cf/*
// @require      https://ajax.aspnetcdn.com/ajax/jquery/jquery-1.11.1.min.js
// @require      https://static.sirin.top/https://cdn.jsdelivr.net/gh/mozilla/localForage/dist/localforage.min.js
// @require      https://www.michaelmickelson.com/js-snackbar/dist/js-snackbar.js?v=1.4
// @icon         https://api.phantom-sea-limited.ltd/favicon.ico
// @grant        GM_log
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      api.phantom-sea-limited.ltd
// @connect      speed.phantom-sea-limited.ltd
// @connect      dl.sirin.top
// @run-at       document-body
// @updateURL    https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/nhimmeo.user.js
// @downloadURL  https://static.sirin.top/https://github.com/phantom-sea-limited/Crawler/raw/main/nhimmeo.user.js
// @license      MIT
// ==/UserScript==

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

class Article {
    ID;
    bookname = null;
    cover = null;
    details = null;
    author = null;
    tag = null;
    chapterList = [];
    init_status = false;
    load_status = false
    constructor(ID, mode = "normal") {
        this.ID = ID;
        this.mode = mode
        // this.load();
    }

    async init() {
        this.init_status = true
        Task.add(
            [
                Task.createBymethod(this.ID, "fetchInfo", this.mode),
                Task.createBymethod(this.ID, "fetchCatalog", this.mode),
                Task.createBymethod(this.ID, "PrefetchChapter", this.mode),
                Task.createBymethod(this.ID, "file", this.mode),
                `Cloud.UploadTask(${this.ID},  "${this.mode}")`
            ]
        )
        await this.save()
        setTimeout(Task.init, 200)
    }

    async reinit() {
        await this.load()
        if (this.init_status != true) {
            Task.add(
                [
                    Task.createBymethod(this.ID, "fetchInfo", this.mode),
                    Task.createBymethod(this.ID, "fetchCatalog", this.mode),
                    Task.createBymethod(this.ID, "PrefetchChapter", this.mode),
                    Task.createBymethod(this.ID, "file", this.mode),
                    `Cloud.UploadTask(${this.ID}, "${this.mode}")`
                ]
            )
            setTimeout(Task.init, 200)
        }
    }

    async fetchInfo() {
        await this.load()
        if (document.location.href == 'https://zh.nhimmeo.cf/book/' + this.ID) {
            this.details = $(".detail_des")[0].innerText
            this.author = $('#book_author')[0].innerText
            this.bookname = $('#book_name')[0].innerText
            this.book_uptime = $('#book_uptime')[0].innerText
            this.cover = $("#pic_cover")[0].dataset.src
            this.tag = $("#book_tags")[0].innerText
        } else {
            Task.add(Task.createBymethod(this.ID, "fetchInfo", this.mode), "push")
            window.Task_STOP = true
            document.location.href = 'https://zh.nhimmeo.cf/book/' + this.ID
        }
    }

    async fetchCatalog() {
        await this.load()
        if (document.location.href == `https://zh.nhimmeo.cf/book/${this.ID}/catalog/`) {
            try {
                //true old,false ok;转换旧目录
                if (this.chapterList[0].lists.length != undefined) {
                    this.chapterList.forEach((chapList) => {
                        var t = chapList.lists
                        chapList.lists = {}
                        t.forEach((chap) => {
                            chapList.lists[chap.href.split('/')[4]] = { ...chap }
                        })
                    })
                }
            } catch { }
            var all = $(".collapsible")
            var i = 0
            while (i < all.length) {
                if (this.chapterList[i] == undefined) {
                    this.chapterList[i] = { "name": all[i].innerText.split("\n")[1], "lists": {} }
                }
                // var catalog = { "name": all[i].innerText.split("\n")[1], "lists": [] }
                var chaplist = $(".chapter_info", all[i].nextElementSibling)
                var j = 0
                while (j < chaplist.length) {
                    var downloadstate = false
                    //更新说明:
                    //由于"该章节未审核通过"的存在,可能会存在free与userchap共存的情况,不过如此修改会导致性能消耗增加
                    //example:https://zh.nhimmeo.cf/shchap/100348098
                    if ($(".fa-battery-full", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-battery-half", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-battery-quarter", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-check-circle", chaplist[j].children)[0] != undefined) { downloadstate = "free" }
                    var href = chaplist[j].nextElementSibling.nextElementSibling.childNodes[0].href
                    var chapid = href.split('/')[4]
                    if (this.chapterList[i].lists[chapid] == undefined) {
                        this.chapterList[i].lists[chapid] = { "content": "" }
                    }
                    this.chapterList[i].lists[chapid] = {
                        "name": chaplist[j].nextElementSibling.nextElementSibling.innerText,
                        "href": href,
                        "CanDownload": downloadstate,
                        ...this.chapterList[i].lists[chapid],
                    }
                    j += 1
                }
                i += 1
            }
        } else {
            Task.add(Task.createBymethod(this.ID, "fetchCatalog", this.mode), "push")
            window.Task_STOP = true
            document.location.href = `https://zh.nhimmeo.cf/book/${this.ID}/catalog/`
        }
    }

    async fetchChapter(i, j) {
        await this.load()
        var chap = this.chapterList[i].lists[j]
        if (chap["CanDownload"] == "userchap") { chap.href = chap.href.replace("/chap/", "/shchap/") }
        if (document.location.href == chap.href) {
            const content = $("article")[0].innerHTML.replaceAll("<br>", "\n").replaceAll("\x04", "")
            if (content.includes('↻ Loading.')) {
                window.Task_STOP = true
                await sleep(1000)
                return await this.fetchChapter(i, j)
            } else {
                window.Task_STOP = false
                chap.content = content
            }
        } else {
            Task.add(Task.create(this.ID, [`await A.fetchChapter(${i},${j})`], this.mode), "push")
            window.Task_STOP = true
            document.location.href = chap.href
        }
    }

    async PrefetchChapter() {
        await this.load()
        if (this.chapterList != null) {
            var tasklists = []
            var i = 0
            this.chapterList.forEach(chap => {
                // var j = 0
                // chap.lists.forEach(chapinfo => {
                //     if (chapinfo['CanDownload'] != false && chapinfo["content"] == "") {
                //         tasklists.unshift(Task.create(this.ID, [`await A.fetchChapter(${i},${j})`], this.mode))
                //     }
                //     j++
                // })
                for (let k in chap.lists) {
                    var chapinfo = chap.lists[k]
                    if (chapinfo['CanDownload'] != false && chapinfo["content"] == "") {
                        tasklists.unshift(Task.create(this.ID, [`await A.fetchChapter(${i},${k})`], this.mode))
                    }
                }
                i++
            })
            if (tasklists.length != 0) {
                tasklists.unshift(Task.createBymethod(this.ID, "PrefetchChapter", this.mode))
            }
            Task.add(tasklists, "push")
        }
    }

    output() {
        return {
            'bookname': this.bookname,
            'cover': this.cover,
            'book_uptime': this.book_uptime,
            'details': this.details,
            'author': this.author,
            'tag': this.tag,
            'chapterList': this.chapterList,
        }
    }

    async file(exportType = 'json') {
        await this.load();

        let blob;
        let fileName;

        if (exportType === 'txt') {
            const txtContent = this.buildTxtContent(this.output());
            blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            fileName = `${this.bookname}.txt`;
        } else {
            const jsonData = JSON.stringify(this.output(), null, 2);
            blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
            fileName = `${this.bookname}.json`;
        }

        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    buildTxtContent(jsonData) {
        let txtContent = '';
        txtContent += `书名: ${jsonData.bookname}\n`;
        txtContent += `作者: ${jsonData.author}\n`;
        txtContent += `标签: ${jsonData.tag}\n`;
        txtContent += `更新时间: ${jsonData.book_uptime}\n`;
        txtContent += `简介: ${jsonData.details}\n\n`;

        jsonData.chapterList.forEach((chapter) => {
            txtContent += `${chapter.name}\n`;
            Object.values(chapter.lists).forEach(chap => {
                let chapterTitle = chap.name;
                if (chap.CanDownload === false) {
                    chapterTitle += " [未共享]";
                } else if (chap.content === "") {
                    chapterTitle += " [无正文]";
                }
                txtContent += `  ${chapterTitle}\n`;

                if (chap.CanDownload !== false && chap.content) {
                    txtContent += `    ${chap.content}\n\n`;
                }
            });
        });

        return txtContent;
    }
    async load() {
        if (this.load_status != true) {
            if (this.mode == "normal") {
                var tmp = Article.localconfig(this.ID);
            } else {
                var tmp = await Article.localforge(this.ID)
                if (tmp == null) { tmp = Article.localconfig(this.ID) }
            }
            if (tmp != null) {
                this.bookname = tmp.bookname;
                this.details = tmp.details;
                this.author = tmp.author;
                this.tag = tmp.tag
                this.chapterList = tmp.chapterList;
                this.cover = tmp.cover;
                this.book_uptime = tmp.book_uptime;
            } else {
                await this.init()
            }
            this.load_status = true
        }
    }

    async save() {
        if (this.mode == "normal") {
            Article.localconfig(this.ID, this.output())
        } else {
            await Article.localforge(this.ID, this.output())
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
}

window.Task_STOP = false
class Task {
    static createBymethod(ID, method, mode = "normal") {
        return `
            var A = new Article(${ID},\"${mode}\")
            A.${method}().then(res=>{A.save()})`
    }

    static create(ID, lines, mode = "normal") {
        function _(lines) {
            var command = ""
            lines.forEach(element => {
                command += element + "\n"
            })
            return command
        }
        return `
            var A = new Article(${ID},\"${mode}\")
            async function _(){
                ${_(lines)}
            }
            _().then(res=>{A.save()})`
    }


    static add(command, mode = "unshift") {
        var commands = window.Task_info
        if (commands == null) { commands = [] }
        if (typeof (command) == 'object') {
            command.forEach(element => {
                if (mode == "unshift") { commands.unshift(element) } else { commands.push(element) }
            })
        } else {
            if (mode == "unshift") { commands.unshift(command) } else { commands.push(command) }
        }
        Task.localconfig(commands)
    }

    static init() {
        window.Task_info = Task.localconfig()
        var commands = window.Task_info
        var command;
        if (commands != null) {
            if (commands.length != 0 && window.Task_STOP != true) {
                command = commands.pop()
                eval(command)
                notice.push(command, Notice.DEBUG)
                Task.localconfig(commands)
            }
            if (commands.length != 0) setTimeout(Task.init, 1000)
        }
        notice.push("Task finish! waiting for another", Notice.INFO)
    }

    static localconfig(msg = '') {
        if (msg === '') {
            return JSON.parse(localStorage.getItem("Task"));
        } else {
            return localStorage.setItem("Task", JSON.stringify(msg))
        }
    }
}
window.Task_info = Task.localconfig()


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
    // s_tr = { 0: "grey", 10: "blue", 20: "warn", 30: "error", 40: "error" }
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
window.notice = new Notice(Notice.INFO, [Notice.console, Notice.snackbar])
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
                nhimmeo.notice.push("人机验证成功!正在上传文件", nhimmeo.Notice.INFO)
                nhimmeo.Cloud.gtoken = e
                nhimmeo.Task_STOP = false
                nhimmeo.Task.init()
            }
            var key = document.createElement("div")
            key.dataset["sitekey"] = "6LdGK5soAAAAAAa_7FBlxgILeaF-uJoUhhyNqjR5"
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

    upload: (ID, mode = "GM") => {
        A = new Article(ID, mode)
        A.load().then(() => { Cloud.createUploadSession(A) })
    },

    createUploadSession: (Article) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.phantom-sea-limited.ltd/release/Cloud/v2/nhimmeo/upload?gtoken=${Cloud.gtoken}&id=${Article.ID}`,
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

    fetchlatest: (ID) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.phantom-sea-limited.ltd/release/Cloud/v1/nhimmeo/download?id=${ID}`,
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
                                    window.localforage.setItem(ID, response.response)
                                    window.notice.push("下载成功，已自动导入", Notice.INFO)
                                } else {
                                    window.notice.push("下载失败，请稍后重试", Notice.ERROR)
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



//INIT
setTimeout(installCSS)
setTimeout(check)
setTimeout(() => { if (document.readyState != "complete") { document.location.href = document.location.href } }, 60000)
function check() {
    notice.push("Start checking!", Notice.DEBUG)
    try {
        if (document.body.innerText.includes("Error code")) {
            document.location.href = document.location.href
        }
        else if (document.body.innerHTML.includes('设置') || document.body.innerHTML.includes('a href="/history"')) {
            const c = new Date().getHours()
            if (c > 23 || c < 12) {
                run()
            } else {
                notice.push("当前时间段不允许爬虫,请给正常用户以访问空间", Notice.ERROR)
                notice.push("请在12点前或23点以后运行爬虫", Notice.ERROR)
            }
        } else {
            setTimeout(check, 2000)
        }
    } catch {
        setTimeout(check, 2000)
    }
}

//insert JS into Page
function install(func) {
    var s = document.createElement("script")
    s.type = "text/javascript"
    s.innerHTML = func.toString()
    document.body.append(s)
}

function installCSS() {
    if (document.body != undefined) {
        var css = document.createElement("link")
        css.rel = 'stylesheet'
        css.href = "https://static.sirin.top/https://www.michaelmickelson.com/js-snackbar/dist/js-snackbar.css?v=1.4"
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
        setTimeout(installCSS)
    }
}

window.Article = Article
window.Task = Task
unsafeWindow.nhimmeo = window


function run() {
    add_button()
    var exp = new Date();
    exp.setTime(exp.getTime() + 1 * 24 * 60 * 60 * 1000 * 365);
    document.cookie = 'auto_use_chapter_vip=on ;path=/ ;expires=' + exp.toGMTString();
    setTimeout(Task.init)
    notice.push("Start running!", Notice.DEBUG)
}

function add_task_status() {
    var l = window.Task_info
    var msg
    if (l == null) { msg = "任务已完成" }
    else if (l.length != 0) { msg = `任务剩余${l.length}` }
    else { msg = "任务已完成" }
    var a = $(".fa-coffee")[0]
    // a.nextElementSibling.href = null
    notice.push(msg, 10)
    a.nextElementSibling.innerText = msg
    if (msg != "任务已完成") {
        setTimeout(add_task_status, 2000)
    }
}

function add_button() {
    var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
    function create(msg, icon, func, colored = "inverse") {
        var button = document.createElement("button")
        button.classList.add(colored)
        button.classList.add("shadowed")
        button.classList.add("small")
        var button_a = document.createElement("a")
        button_a.classList.add("color_white")
        var button_i = document.createElement("i")
        button_i.classList.add("fa")
        button_i.classList.add(icon)
        button_i.ariaHidden = true
        button_a.append(button_i)
        button_a.append(msg)
        button.append(button_a)
        button.onclick = func
        return button
    }
    if (IDs != null) {
        setTimeout(Cloud.recaptcha_init, 1000)
        IDs = IDs[1]
        var main = $(".box-colored")[0]
        // main.append(create("下载(高速)", "fa-download", function () {
        //     var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
        //     IDs = IDs[1]
        //     var A = new Article(IDs)
        //     A.load().then(res => { A.reinit() })
        // }))
        main.append(create("前往云端(临时)", "fa-cloud", function () {
            var url = "https://api.phantom-sea-limited.ltd/release/API/get?id=01T4VX663CLVLERUB5MJGI5DO4YJWOZSTP"
            window.open('javascript:window.name;', '<script>location.replace("' + url + '")<\/script>');
        }))
        main.append(create("下载(稳定)", "fa-download", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs, "async")
            A.load().then(res => { A.reinit() })
        }))
        main.append(document.createElement("br"))
        // main.append(create("修复下载(高速)", "fa-download", function () {
        //     var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
        //     IDs = IDs[1]
        //     var A = new Article(IDs)
        //     A.PrefetchChapter().then(res => { Task.init() })
        // }))
        main.append(create("上传至云端", "fa-cloud-upload", function () {
            if (Cloud.gtoken) { unsafeWindow.grecaptcha.reset() }
            unsafeWindow.grecaptcha.execute()
            Task.add(`Cloud.upload(${IDs})`)
        }))
        main.append(create("修复下载(稳定)", "fa-download", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs, "async")
            A.PrefetchChapter().then(res => { Task.init() })
        }))
        main.append(document.createElement("br"))
        // main.append(create("手动导出(高速)", "fa-floppy-o", function () {
        //     var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
        //     IDs = IDs[1]
        //     var A = new Article(IDs)
        //     A.file()
        // }))
        // main.append(document.createElement("br"))
        main.append(create("下载云端最新文件", "fa-cloud-download", function () {
            // window.notice.push("尚未完工", Notice.ERROR)
            Cloud.fetchlatest(IDs)
        }))
        main.append(create("手动导出(稳定)", "fa-floppy-o", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs, "async")
            A.file()
        }))
        main.append(create("导出TXT", "fa-file-text-o", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/);
            if (IDs) {
                IDs = IDs[1];
                var A = new Article(IDs, "async");
                A.file('txt');
            }
        }))
        main.append(document.createElement("br"))
        main.append(create("清空高速缓存", "fa-times", function () {
            var book_mark = localStorage.getItem("book_mark")
            localStorage.clear()
            localStorage.setItem("book_mark", book_mark)
        }, "secondary"))
        // main.append(document.createElement("br"))
        main.append(create("清空稳定缓存", "fa-times", function () {
            localforage.clear()
        }, "secondary"))
    } else {
        if (document.location.href.includes('chap')) {
            var main = $("div.center")[2]
            main.append(create("终止任务", "fa-times", function () {
                window.Task_STOP = true
                window.Task_info = []
                Task.localconfig([])
            }, "secondary"))
        }
        setTimeout(add_task_status)
    }
}

GM_registerMenuCommand("终止任务", () => {
    window.Task_STOP = true
    window.Task_info = []
    Task.localconfig([])
})

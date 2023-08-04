// ==UserScript==
// @name         nhimmeo下载工具
// @namespace    Rcrwrate
// @version      1.6
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://zh.nhimmeo.cf/*
// @require      https://ajax.aspnetcdn.com/ajax/jquery/jquery-1.11.1.min.js
// @require      https://static.deception.world/https://cdn.jsdelivr.net/gh/mozilla/localForage/dist/localforage.min.js
// @require      https://static.deception.world/https://fezvrasta.github.io/snackbarjs/dist/snackbar.min.js
// @icon         https://api.phantom-sea-limited.ltd/favicon.ico
// @grant        GM_log
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==


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
            var all = $(".collapsible")
            var i = 0
            var oldchaperList = [...this.chapterList]
            this.chapterList = []
            while (i < all.length) {
                var catalog = { "name": all[i].innerText.split("\n")[1], "lists": [] }
                var chaplist = $(".chapter_info", all[i].nextElementSibling)
                var j = 0
                while (j < chaplist.length) {
                    var downloadstate = false
                    if ($(".fa-check-circle", chaplist[j].children)[0] != undefined) { downloadstate = "free" }
                    else if ($(".fa-battery-full", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-battery-half", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-battery-quarter", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    catalog.lists.push(
                        {
                            "name": chaplist[j].nextElementSibling.nextElementSibling.innerText,
                            "href": chaplist[j].nextElementSibling.nextElementSibling.childNodes[0].href,
                            "content": "",
                            "CanDownload": downloadstate
                        }
                    )
                    j += 1
                }
                this.chapterList.push(catalog)
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
            chap.content = $("article")[0].innerHTML.replaceAll("<br>", "")
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
                var j = 0
                chap.lists.forEach(chapinfo => {
                    if (chapinfo['CanDownload'] != false && chapinfo["content"] == "") {
                        tasklists.unshift(Task.create(this.ID, [`await A.fetchChapter(${i},${j})`], this.mode))
                    }
                    j++
                })
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
                setTimeout(Task.init, 200)
            }
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
    s_tr = { 0: "grey", 10: "blue", 20: "warn", 30: "error", 40: "error" }

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
        $.snackbar({
            content: msg, // text of the snackbar
            style: `toast ${this.s_tr[level]}`, // add a custom class to your snackbar
            timeout: 1000 // time in milliseconds after the snackbar autohides, 0 is disabled
        })
    }
}
window.notice = new Notice(Notice.DEBUG, [Notice.console, Notice.snackbar])

//INIT
setTimeout(install)
setTimeout(check)
setTimeout(() => { if (document.readyState != "complete") { document.location.href = document.location.href } }, 15000)
function check() {
    notice.push("Start checking!", Notice.DEBUG)
    try {
        if (document.body.innerText.includes("Error code")) {
            document.location.href = document.location.href
        }
        else if (document.body.innerText.includes("请勿往国内社区流传。感谢。")) {
            run()
        } else {
            setTimeout(check, 2000)
        }
    } catch {
        setTimeout(check, 2000)
    }
}

function install() {
    var css = document.createElement("link")
    css.rel = 'stylesheet'
    css.href = "https://static.deception.world/https://fezvrasta.github.io/snackbarjs/dist/snackbar.min.css"
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
        IDs = IDs[1]
        var main = $(".box-colored")[0]
        main.append(create("下载(高速)", "fa-download", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs)
            A.load().then(res => { A.reinit() })
        }))
        // main.append(document.createElement("br"))
        main.append(create("下载(稳定)", "fa-download", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs, "async")
            A.load().then(res => { A.reinit() })
        }))
        main.append(document.createElement("br"))
        main.append(create("修复下载(高速)", "fa-download", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs)
            A.PrefetchChapter().then(res => { Task.init() })
        }))
        // main.append(document.createElement("br"))
        main.append(create("修复下载(稳定)", "fa-download", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs, "async")
            A.PrefetchChapter().then(res => { Task.init() })
        }))
        main.append(document.createElement("br"))
        main.append(create("手动导出(高速)", "fa-floppy-o", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs)
            A.file()
        }))
        // main.append(document.createElement("br"))
        main.append(create("手动导出(稳定)", "fa-floppy-o", function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs, "async")
            A.file()
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


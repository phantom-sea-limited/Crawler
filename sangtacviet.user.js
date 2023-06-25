// ==UserScript==
// @name         STV
// @namespace    https://sangtacviet.vip/
// @version      1.0
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://sangtacviet.vip/*
// @match        https://zh.nhimmeo.cf/book/*
// @match        https://wap.ciweimao.com/book/*
// @icon         https://api.phantom-sea-limited.ltd/favicon.ico
// @require      https://static.deception.world/https://cdn.jsdelivr.net/gh/mozilla/localForage/dist/localforage.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
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
                ]
            )
            setTimeout(Task.init, 200)
        }
    }

    async fetchInfo() {
        await this.load()
        if (document.location.href == `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/`) {
            this.details = ""
            this.author = bookinfo.author
            this.bookname = bookinfo.name
            this.book_uptime = bookinfo.lastupdate
            this.cover = bookinfo.thumb
            this.tag = ""
        } else {
            await Task.add(Task.createBymethod(this.ID, this.ori, "fetchInfo", this.mode), "push")
            window.Task_STOP = true
            document.location.href = `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/`
        }
    }

    async fetchCatalog() {
        await this.load()
        if (document.location.href == `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/`) {
            var log = localStorage.getItem("LOG")
            if (log == null) {
                insert()
                window.Task_STOP = true
                await sleep(5000)
                await this.fetchCatalog()
                window.Task_STOP = false
            } else {
                // var oldchaperList = [...this.chapterList]
                this.chapterList = []
                var chaps = log.split("-//-")
                var chaplist = {}
                chaps.forEach(chap => {
                    var chap = chap.split("-/-")
                    if (chap.length == 3) {
                        chaplist[chap[1]] = {
                            "name": chap[2],
                            "href": `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/${chap[1]}/`,
                            "content": "",
                            "CanDownload": true
                        }
                    } else if (chap.length == 4) {
                        if (chap[3] == "unvip") { var CanDownload = true } else { var CanDownload = false }
                        chaplist[chap[1]] = {
                            "name": chap[2],
                            "href": `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/${chap[1]}/`,
                            "content": "",
                            "CanDownload": CanDownload
                        }
                    } else {
                        GM_log(chap)
                    }
                })
                this.chapterList.push(chaplist)
            }
        } else {
            await Task.add(Task.createBymethod(this.ID, this.ori, "fetchCatalog", this.mode), "push")
            window.Task_STOP = true
            document.location.href = `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/`
        }
    }

    async translateCatalog() {
        await this.load()
        async function c(Article) {
            if (document.body.innerText.includes("书籍不存在或未审核通过")) {
                Article.more['c'] = "failed"
                await Article.save()
            }
            if (document.location.href == `https://wap.ciweimao.com/book/${Article.ID}`) {
                var main = document.getElementsByClassName("cnt-inner")[0]
                var h2 = main.getElementsByTagName("h2")
                var ul = main.getElementsByTagName("ul")
                var i = 0
                Article.chapterList = Article.chapterList.slice(0, 1)
                while (i < h2.length) {
                    var chap = { "name": h2[i].innerText, "lists": {} }
                    var j = 0
                    while (j < ul[i].children.length) {
                        var ID = ul[i].children[j].children[0].href.replace("https://wap.ciweimao.com/chapter/", "")
                        chap.lists[ID] = Article.chapterList[0][ID]
                        chap.lists[ID]["name"] = ul[i].children[j].innerText
                        j++
                    }
                    i++
                    Article.chapterList.push(chap)
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
                Article.chapterList = Article.chapterList.slice(0, 1)
                while (i < all.length) {
                    var catalog = { "name": all[i].innerText.split("\n")[1], "lists": {} }
                    var chaplist = all[i].nextElementSibling.getElementsByClassName("chapter_info")
                    var j = 0
                    while (j < chaplist.length) {
                        var downloadstate = false
                        var ID = chaplist[j].nextElementSibling.nextElementSibling.childNodes[0].href.split('/').pop()
                        catalog.lists[ID] = Article.chapterList[0][ID]
                        catalog.lists[ID]['name'] = chaplist[j].nextElementSibling.nextElementSibling.innerText
                        j += 1
                    }
                    Article.chapterList.push(catalog)
                    i += 1
                }
            } else {
                await Task.add(Task.createBymethod(Article.ID, Article.ori, "translateCatalog", Article.mode), "push")
                window.Task_STOP = true
                document.location.href = `https://zh.nhimmeo.cf/book/${Article.ID}/catalog/`
            }
        }
        if (this.ori == "ciweimao" && this.more['c'] == undefined) { await c(this) }
        else if (this.ori == "ciweimao") { await c2(this) }
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
        if (this.ori == "ciweimao") { await c(this) }
    }

    async fetchChapter(i, j) {
        await this.load()
        var chap = this.chapterList[i].lists[j]
        if (document.location.href == chap.href) {
            if (chapterfetcher.responseText != "") {
                var content = document.getElementsByClassName("contentbox")[1]
                content.children[0].remove()
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
                    if (chapinfo['CanDownload'] != false && chapinfo["content"] == "") {
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
                if (tmp == null) { tmp = Article.localforge(this.ID) }
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
                    GM_log(command)
                    await Task.localconfig(commands)
                }
                setTimeout(Task.init, 1000)
            }
        }
        GM_log("Task finish! waiting for another")
    }

    static async localconfig(msg = '') {
        return await Article.GM_config("Task", msg)
    }
}
window.Task_info = await Task.localconfig()
window.Task_statu = null


// INIT
setTimeout(check)
function check() {
    GM_log("Start checking!")
    try {
        if (document.location.hostname == "sangtacviet.vip") {
            if (document.body.innerText.contain("检查站点连接是否安全") || document.body.innerText.contain("Error code")) {
                setTimeout(check, 2000)
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
        }
    } catch {
        setTimeout(check, 2000)
    }
}

function run() {
    var exp = new Date();
    exp.setTime(exp.getTime() + 1 * 24 * 60 * 60 * 1000 * 365);
    document.cookie = 'transmode=chinese	 ;path=/ ;expires=' + exp.toGMTString();
    GM_log("Start running!")

    var IDs = document.location.href.match(/\/(ciweimao|sfacg)\/\d+\/(\d+)\/$/)
    window.IDs = IDs
    setTimeout(add_button)
    setTimeout(insert)
    setTimeout(Task.init)
    setTimeout(add_task_status)
}

//insert JS into Page
function insert() {
    function install(func) {
        var s = document.createElement("script")
        s.type = "text/javascript"
        s.innerHTML = func.toString()
        document.body.append(s)
    }
    function EX(a, b, c, d = null) {
        window.STV = {}
        window.STV.Article = a
        window.STV.Task = b
        window.STV.window = c
        window.a = d
    }
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
    install(EX)
    force()
}

function force() {
    var force = create("测试", "fa fa-certificate", function () {
        EX(Article, Task, window)
    })
    force.style.display = "none"
    document.body.append(force)
    force.click()
}

//Message PART
function title() {
    if (IDs == null) {
        return document.getElementById("tm-nav-search-top-right").children[0]
    } else {
        return document.getElementById("book_name2")
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
    css.href = "https://static.deception.world/https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    document.body.append(css)

    if (IDs != null) {
        main = document.getElementsByClassName("row justify-content-md-center")[0]
        main.innerHTML = ""
        main.append(create("下载", "fa fa-download", function () {
            var A = new Article(IDs[2], IDs[1], "GM")
            A.load().then(res => { A.reinit() })
        }))
        main.append(create("修复下载", "fa fa-download", function () {
            var A = new Article(IDs[2], IDs[1], "GM")
            A.PrefetchChapter().then(res => { Task.init() })
        }))
        main.append(create("手动导出", "fa fa-floppy-o", function () {
            var A = new Article(IDs[2], IDs[1], "GM")
            A.load().then(res => { A.file() })
        }))
        main.append(create("注入", "fa fa-certificate", function () {
            var A = new Article(IDs[2], IDs[1], "GM")
            A.load().then(res => {
                EX(Article, Task, window, A)
            })
            title().innerText = "注入已执行"
        }))
    } else {
        // main = document.getElementById("tm-nav-search-logo").parentElement
        // main = document.getElementById("tm-nav-search-top-right")
        main = document.getElementsByClassName("input-group")[0]
        main.append(create("终止任务", "fa fa-times", function () {
            window.Task_STOP = true
            window.Task_info = []
            Task.localconfig([])
            title().innerText = "任务已终止"
        }))
    }
}

async function add_task_status() {
    var l = window.Task_info
    var msg
    if (l == null) { msg = "任务已完成" }
    else if (l.length != 0) { msg = `任务剩余${l.length}` }
    else { msg = "任务已完成" }
    title().innerText = msg
    if (msg != "任务已完成") {
        setTimeout(add_task_status, 2000)
    }
}
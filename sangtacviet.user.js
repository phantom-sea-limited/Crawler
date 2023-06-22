// ==UserScript==
// @name         STV
// @namespace    https://sangtacviet.vip/
// @version      1.0
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://sangtacviet.vip/*
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
    load_status = false
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
            if (window.log == null) {
                insert()
                await sleep(1000)
                await this.fetchCatalog()
            } else {
                var oldchaperList = [...this.chapterList]
                this.chapterList = []
                var chaps = window.log.split("-//-")
                var chaplist = []
                chaps.forEach(chap => {
                    var chap = chap.split("-/-")
                    if (chap.length == 3) {
                        chaplist.push({
                            "name": chap[2],
                            "href": `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/${chap[1]}`,
                            "content": "",
                            "CanDownload": true
                        })
                    } else if (chap.length == 4) {
                        if (chap[3] == "unvip") { var CanDownload = true } else { var CanDownload = false }
                        chaplist.push({
                            "name": chap[2],
                            "href": `https://sangtacviet.vip/truyen/${this.ori}/1/${this.ID}/${chap[1]}`,
                            "content": "",
                            "CanDownload": CanDownload
                        })
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

    async fetchChapter(i, j) {
        await this.load()
        var chap = this.chapterList[i].lists[j]
        if (chap["CanDownload"] == "userchap") { chap.href = chap.href.replace("/chap/", "/shchap/") }
        if (document.location.href == chap.href) {
            chap.content = $("article")[0].innerHTML.replaceAll("<br>", "")
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
            var i = 0
            this.chapterList.forEach(chap => {
                var j = 0
                chap.lists.forEach(chapinfo => {
                    if (chapinfo['CanDownload'] != false && chapinfo["content"] == "") {
                        tasklists.unshift(Task.create(this.ID, this.ori, [`await A.fetchChapter(${i},${j})`], this.mode))
                    }
                    j++
                })
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
            var A = new Article(${ID},${ori},\"${mode}\")
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
            var A = new Article(${ID},${ori},\"${mode}\")
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
            if (commands.length != 0 && window.Task_STOP != true) {
                command = commands.pop()
                eval(command)
                GM_log(command)
                await Task.localconfig(commands)
                setTimeout(Task.init, 200)
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
    try {
        if (document.body.innerText.contain("检查站点连接是否安全") || document.body.innerText.contain("Error code")) {
            setTimeout(check, 1000)
        } else {
            run()
        }
    } catch {
        setTimeout(check, 1000)
    }

}

function run() {
    var exp = new Date();
    exp.setTime(exp.getTime() + 1 * 24 * 60 * 60 * 1000 * 365);
    document.cookie = 'transmode=chinese	 ;path=/ ;expires=' + exp.toGMTString();
    GM_log("Start running!")

    window.log = null
    var IDs = document.location.href.match(/\/(ciweimao|sfacg)\/\d+\/(\d+)\/$/)
    window.IDs = IDs
    if (IDs != null) {
        setTimeout(insert)
        setTimeout(add_button)
    }
    setTimeout(Task.init)
    setTimeout(add_task_status)
}

function decryptAes(encrypted, key, iv) {
    encrypted = CryptoJS.enc.Base64.parse(encrypted);
    key = CryptoJS.enc.Utf8.parse(key);
    iv = CryptoJS.enc.Utf8.parse(iv);
    var decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, { iv: iv });
    var out = decrypted.toString(CryptoJS.enc.Utf8);
    window.log = out
    return out
}

//insert JS into Page
function insert() {
    function install(func) {
        var s = document.createElement("script")
        s.type = "text/javascript"
        s.innerHTML = func.toString()
        document.body.append(s)
    }
    function EX(a, b, c) {
        window.Article = a
        window.Task = b
        window.a = c
    }
    install(decryptAes)
    renewchapter()
    install(EX)
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
function add_button() {
    function create(info, icon, func) {
        var d = document.createElement("div")
        d.classList.add("col-lg-2")
        d.classList.add("col-3")
        d.innerHTML = `<span class="blk-item"><i class="${icon}"></i><br>${info}</span>`
        d.onclick = func
        return d
    }
    var main = document.getElementsByClassName("row justify-content-md-center")[0]
    main.innerHTML = ""
    main.append(create("注入", "fa fa-certificate", function () {
        var a = new Article(IDs[2], IDs[1], "GM")
        a.load().then(res => {
            EX(Article, Task, a)
        })
        title().innerText = "注入已执行"
    }))
}

async function add_task_status() {
    var l = await Task.localconfig()
    var msg
    if (l == null) { msg = "任务已完成" }
    else if (l.length != 0) { msg = `任务剩余${l.length}` }
    else { msg = "任务已完成" }
    title().innerText = msg
    if (msg != "任务已完成") {
        setTimeout(add_task_status, 2000)
    }
}
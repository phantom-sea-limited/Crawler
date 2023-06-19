// ==UserScript==
// @name         lightnovel.us下载工具
// @namespace    https://www.lightnovel.us/
// @version      1.0
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://www.lightnovel.us/*
// @require      https://static.deception.world/https://cdn.jsdelivr.net/gh/mozilla/localForage/dist/localforage.min.js
// @icon         https://api.phantom-sea-limited.ltd/favicon.ico
// @grant        none
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
        if (document.location.href == 'https://www.lightnovel.us/cn/series/' + this.ID) {
            var main = document.getElementsByClassName("top-title")[0]
            this.details = window.__NUXT__.data[0].series.intro
            this.author = window.__NUXT__.data[0].series.author
            this.bookname = main.children[0].innerText
            this.book_uptime = window.__NUXT__.data[0].series.last_time
            this.cover = window.__NUXT__.data[0].series.cover
            this.tag = ""
        } else {
            Task.add(Task.createBymethod(this.ID, "fetchInfo", this.mode), "push")
            window.Task_STOP = true
            document.location.href = 'https://www.lightnovel.us/cn/series/' + this.ID
        }
    }

    async fetchCatalog() {
        await this.load()
        if (document.location.href == `https://www.lightnovel.us/cn/series/` + this.ID) {
            var oldchaperList = [...this.chapterList]
            this.chapterList = [[]]
            window.__NUXT__.data[0].pages[0].forEach(chap => {
                this.chapterList[0].push({
                    "name": chap['title'],
                    "href": "https://www.lightnovel.us/cn/detail/" + chap['aid'],
                    "content": "",
                    "cover": chap['cover'],
                })
            })
        } else {
            Task.add(Task.createBymethod(this.ID, "fetchCatalog", this.mode), "push")
            window.Task_STOP = true
            document.location.href = `https://www.lightnovel.us/cn/series/` + this.ID
        }
    }

    async fetchChapter(i, j) {
        await this.load()
        var chap = this.chapterList[i][j]
        if (document.location.href == chap.href) {
            chap.content = document.getElementById("article-main-contents").innerHTML.replaceAll("<br>", "\n")
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
                chap.forEach(chapinfo => {
                    if (chapinfo["content"] == "") {
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
                console.log(command)
                Task.localconfig(commands)
                setTimeout(Task.init, 200)
            }
        }
        console.log("Task finish! waiting for another")
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

window.Article = Article
window.Task = Task
window.Task_statu = null
window.onload = function _init() {
    window.Task_statu = "installed"
    // document.getElementsByClassName("sidebar-buttons")[0].children[2].click() //自动点击繁简切换按钮
    // add_button()
    setTimeout(Task.init)
}

setTimeout(check_Task_status, 5000)
function check_Task_status() {
    if (window.Task_statu != "installed") {
        window.onload()
    }
}

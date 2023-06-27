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
    add_button()
    setTimeout(Task.init)
    // document.getElementsByClassName("sidebar-buttons")[0].children[2].click() //自动点击繁简切换按钮
}

setTimeout(check_Task_status, 5000)
function check_Task_status() {
    if (window.Task_statu != "installed") {
        window.onload()
        setTimeout(check_Task_status, 5000)
    }
}

function add_task_status() {
    var l = window.Task_info
    var msg
    if (l == null) { msg = "任务已完成" }
    else if (l.length != 0) { msg = `任务剩余${l.length}` }
    else { msg = "任务已完成" }
    document.getElementsByClassName("nav-dl")[0].innerText = msg
    if (msg != "任务已完成") {
        setTimeout(add_task_status, 2000)
    }
}

function add_button() {
    IDs = document.location.href.match(/https:\/\/www.lightnovel.us\/cn\/series\/(\d+)$/)

    function create(svg, text, func) {
        var button = document.createElement("button")
        button.innerHTML = svg + text
        button.onclick = func
        button.classList.add("btn")
        button.classList.add("btn-rate")
        button.classList.add("mar-right-20")
        return button
    }
    if (IDs != null) {
        IDs = IDs[1]
        var main = document.getElementsByClassName("btns mar-top-30")[0]
        main.children[1].classList.remove("btn-collect")
        main.children[1].classList.add("btn-rate")
        main.children[1].classList.add("mar-right-20")
        main.append(create(
            `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#cfcfcf}</style><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`,
            '下载', function () {
                var A = new Article(window.__NUXT__.data[0].series.sid, "async")
                A.load().then(res => { A.reinit() })
            }
        ))
        main.append(create(
            `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#cfcfcf}</style><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`,
            '修复下载', function () {
                var A = new Article(window.__NUXT__.data[0].series.sid, "async")
                A.PrefetchChapter().then(res => { Task.init() })
            }
        ))
        main.append(create(
            `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#adadad}</style><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`,
            '手动导出', function () {
                var A = new Article(window.__NUXT__.data[0].series.sid, "async")
                A.file()
            }
        ))
        main.append(create(
            `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#999999}</style><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
            '清空缓存', function () {
                localforage.clear()
                var vuex = localStorage.getItem("vuex")
                var last_read = localStorage.getItem("last_read")
                localStorage.clear()
                localStorage.setItem("vuex", vuex)
                localStorage.setItem("last_read", last_read)
            }
        ))

    }
    var lab = document.getElementsByClassName("nav flex jc-between")[0]
    lab.insertBefore(create(
        `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#999999}</style><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
        '终止任务', function () {
            window.Task_STOP = true
            window.Task_info = []
            Task.localconfig([])
        }
    ), lab.children[2])
    setTimeout(add_task_status)
}
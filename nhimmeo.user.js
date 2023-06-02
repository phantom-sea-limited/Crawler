// ==UserScript==
// @name         nhimmeo下载工具
// @namespace    https://zh.nhimmeo.cf/
// @version      1.1
// @description  防止防火墙，直接采用前端js进行爬虫
// @author       Rcrwrate
// @match        https://zh.nhimmeo.cf/*
// @require      https://static.deception.world/https://cdn.jsdelivr.net/gh/mozilla/localForage/dist/localforage.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nhimmeo.cf
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
    constructor(ID) {
        this.ID = ID;
        this.load();
    }

    init() {
        this.init_status = true
        Task.add(
            [
                Task.createBymethod(this.ID, "fetchInfo"),
                Task.createBymethod(this.ID, "fetchCatalog"),
                Task.createBymethod(this.ID, "PrefetchChapter"),
                Task.createBymethod(this.ID, "file"),
            ]
        )
        this.save()
        Task.init()
    }

    reinit() {
        if (this.init_status != true) {
            Task.add(
                [
                    Task.createBymethod(this.ID, "fetchInfo"),
                    Task.createBymethod(this.ID, "fetchCatalog"),
                    Task.createBymethod(this.ID, "PrefetchChapter"),
                    Task.createBymethod(this.ID, "file"),
                ]
            )
        }
    }

    fetchInfo() {
        if (document.location.href == 'https://zh.nhimmeo.cf/book/' + this.ID) {
            this.details = $(".detail_des")[0].innerText
            this.author = $('#book_author')[0].innerText
            this.bookname = $('#book_name')[0].innerText
            this.book_uptime = $('#book_uptime')[0].innerText
            this.cover = $("#pic_cover")[0].dataset.src
            this.tag = $("#book_tags")[0].innerText
        } else {
            Task.add(Task.createBymethod(this.ID, "fetchInfo"), "push")
            window.Task_STOP = true
            document.location.href = 'https://zh.nhimmeo.cf/book/' + this.ID
        }
    }

    fetchCatalog() {
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
            Task.add(Task.createBymethod(this.ID, "fetchCatalog"), "push")
            window.Task_STOP = true
            document.location.href = `https://zh.nhimmeo.cf/book/${this.ID}/catalog/`
        }
    }

    fetchChapter(i, j) {
        var chap = this.chapterList[i].lists[j]
        if (chap["CanDownload"] == "userchap") { chap.href = chap.href.replace("/chap/", "/shchap/") }
        if (document.location.href == chap.href) {
            chap.content = $("article")[0].innerHTML.replaceAll("<br>", "")
        } else {
            Task.add(Task.create(this.ID, [`A.fetchChapter(${i},${j})`]), "push")
            window.Task_STOP = true
            document.location.href = chap.href
        }
    }

    PrefetchChapter() {
        if (this.chapterList != null) {
            var tasklists = []
            var i = 0
            this.chapterList.forEach(chap => {
                var j = 0
                chap.lists.forEach(chapinfo => {
                    if (chapinfo['CanDownload'] != false && chapinfo["content"] == "") {
                        tasklists.unshift(Task.create(this.ID, [`A.fetchChapter(${i},${j})`]))
                    }
                    j++
                })
                i++
            })
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

    file() {
        let link = document.createElement('a');
        link.download = `${this.bookname}.json`;
        let blob = new Blob([JSON.stringify(this.output())], { type: 'text/json' });
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    load() {
        var tmp = Article.localconfig(this.ID);
        if (tmp != null) {
            // function s(one, two) {
            //     try { one = two } catch { }
            // }
            // s(this.bookname, tmp.bookname);
            // s(this.details, tmp.details);
            // s(this.author, tmp.author);
            // s(this.chapterList, tmp.chapterList);
            this.bookname = tmp.bookname;
            this.details = tmp.details;
            this.author = tmp.author;
            this.tag = tmp.tag
            this.chapterList = tmp.chapterList;
            this.cover = tmp.cover;
            this.book_uptime = tmp.book_uptime;
        } else {
            this.init()
        }
    }

    save() {
        Article.localconfig(this.ID, this.output())
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
window.Task_info = null
class Task {
    static createBymethod(ID, method) {
        return `(function () {
            var A = new Article(${ID})
            A.${method}()
            A.save();
        })()`
    }

    static create(ID, lines) {
        function _(lines) {
            var command = ""
            lines.forEach(element => {
                command += element + "\n"
            })
            return command
        }
        return `(function () {
            var A = new Article(${ID})
            ${_(lines)}
            A.save();
        })()`
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
            while (commands.length != 0 && window.Task_STOP != true) {
                // if (document.readyState == "complete") {
                command = commands.pop()
                eval(command)
                console.log(command)
                Task.localconfig(commands)
                // }
            }
        }
        console.log("Task all over!")
    }

    static localconfig(msg = '') {
        if (msg === '') {
            return JSON.parse(localStorage.getItem("Task"));
        } else {
            return localStorage.setItem("Task", JSON.stringify(msg))
        }
    }
}

window.Article = Article
window.Task = Task
window.Task_statu = null
window.onload = function _init() {
    window.Task_statu = "installed"
    add_button()
    var exp = new Date();
    exp.setTime(exp.getTime() + 1 * 24 * 60 * 60 * 1000 * 365);
    document.cookie = 'auto_use_chapter_vip=on ;path=/ ;expires=' + exp.toGMTString();
    setTimeout(Task.init)
}

setTimeout(check_Task_status, 5000)
function check_Task_status() {
    if (window.Task_statu != "installed") {
        window.onload()
    }
}




function add_button() {
    IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
    if (IDs != null) {
        IDs = IDs[1]

        var button = document.createElement("button")
        button.classList.add("inverse")
        button.classList.add("shadowed")
        button.classList.add("small")
        var button_a = document.createElement("a")
        button_a.classList.add("color_white")
        var button_i = document.createElement("i")
        button_i.classList.add("fa")
        button_i.classList.add("fa-download")
        button_i.ariaHidden = true
        button_a.append(button_i)
        button_a.append("下载")
        button.append(button_a)
        button.onclick = function () {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            IDs = IDs[1]
            var A = new Article(IDs)
            A.reinit()
        }
        $(".box-colored")[0].append(button)
    }
}
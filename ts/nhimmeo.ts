import { Engine } from "./Engine";
import { Task as task } from "./Task";
import { LocalStorage, Localforage, defaultStorge } from "./Storge";
import { Notice } from "./Notice";
import { cloud } from "./Cloud";
import localforage from "localforage";

interface chap {
    CanDownload: false | "userchap" | "free"
    content: string
    href: string
    name: string
}
interface chaplist {
    "name": string,
    "lists": {
        [chapid: string]: chap
    }
}
class Nhimmeo extends Engine {
    chapterList: chaplist[]

    constructor(ID: string, ori: string, storge: defaultStorge = new Localforage()) {
        super(ID, ori, storge)
    }

    async TaskINIT(): Promise<void> {
        await Task.add(
            [
                Task.createBymethod(this.ID, this.ori, "fetchInfo", this.storge.constructor.name),
                Task.createBymethod(this.ID, this.ori, "fetchCatalog", this.storge.constructor.name),
                Task.createBymethod(this.ID, this.ori, "PrefetchChapter", this.storge.constructor.name),
                Task.createBymethod(this.ID, this.ori, "file", this.storge.constructor.name),
                `Cloud.UploadTask(${this.ID}, ${this.ori}, "new ${this.storge.constructor.name}()")`
            ]
        )
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
            Task.add(Task.createBymethod(this.ID, this.ori, "fetchInfo", this.storge.constructor.name), "push")
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
                        //@ts-ignore
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
                    var downloadstate: false | "userchap" | "free" = false
                    //更新说明:
                    //由于"该章节未审核通过"的存在,可能会存在free与userchap共存的情况,不过如此修改会导致性能消耗增加
                    //example:https://zh.nhimmeo.cf/shchap/100348098
                    if ($(".fa-battery-full", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-battery-half", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-battery-quarter", chaplist[j].children)[0] != undefined) { downloadstate = "userchap" }
                    else if ($(".fa-check-circle", chaplist[j].children)[0] != undefined) { downloadstate = "free" }
                    //@ts-ignore
                    var href = chaplist[j].nextElementSibling.nextElementSibling.childNodes[0].href
                    var chapid = href.split('/')[4]
                    if (this.chapterList[i].lists[chapid] == undefined) {
                        //@ts-ignore
                        this.chapterList[i].lists[chapid] = { "content": "" }
                    }
                    this.chapterList[i].lists[chapid] = {
                        //@ts-ignore
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
            Task.add(Task.createBymethod(this.ID, this.ori, "fetchCatalog", this.storge.constructor.name), "push")
            window.Task_STOP = true
            document.location.href = `https://zh.nhimmeo.cf/book/${this.ID}/catalog/`
        }
    }

    async fetchChapter(i, j) {
        await this.load()
        var chap = this.chapterList[i].lists[j]
        if (chap["CanDownload"] == "userchap") { chap.href = chap.href.replace("/chap/", "/shchap/") }
        if (document.location.href == chap.href) {
            //@ts-ignore
            chap.content = $("article")[0].innerHTML.replaceAll("<br>", "")
        } else {
            Task.add(Task.create(this.ID, this.ori, [`await A.fetchChapter(${i},${j})`], this.storge.constructor.name), "push")
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
                        tasklists.unshift(Task.create(this.ID, this.ori, [`await A.fetchChapter(${i},${k})`], this.storge.constructor.name))
                    }
                }
                i++
            })
            if (tasklists.length != 0) {
                tasklists.unshift(Task.createBymethod(this.ID, this.ori, "PrefetchChapter", this.storge.constructor.name))
            }
            Task.add(tasklists, "push")
        }
    }
}
//@ts-ignore
window.Article = Nhimmeo
window.Task = task
let Task = task
window.Task_storge = new LocalStorage()
window.notice = new Notice(Notice.DEBUG)
let Cloud = new cloud("nhimmeo", "6LdGK5soAAAAAAa_7FBlxgILeaF-uJoUhhyNqjR5")
window.Cloud = Cloud
unsafeWindow.nhimmeo = window

//INIT
setTimeout(installCSS)
setTimeout(check)
setTimeout(() => { if (document.readyState != "complete") { document.location.href = document.location.href } }, 15000)
function check() {
    window.notice.push("Start checking!", Notice.DEBUG)
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

function installCSS() {
    if (document.body != undefined) {
        var css = document.createElement("link")
        css.rel = 'stylesheet'
        css.href = "https://static.sirin.top/https://www.michaelmickelson.com/js-snackbar/dist/js-snackbar.css?v=1.4"
        document.body.append(css)
        var css2 = document.createElement("style")
        css2.innerHTML = `
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
        document.body.append(css2)
    } else {
        setTimeout(installCSS)
    }
}


function run() {
    add_button()
    //@ts-ignore
    Cookies.set("auto_use_chapter_vip", "on", { expires: 300 })
    setTimeout(Task.init, 1000)
    window.notice.push("Start running!", Notice.DEBUG)
}

function add_task_status() {
    var l = window.Task_info
    var msg
    if (l == null) { msg = "任务已完成" }
    else if (l.length != 0) { msg = `任务剩余${l.length}` }
    else { msg = "任务已完成" }
    var a = $(".fa-coffee")[0]
    // a.nextElementSibling.href = null
    window.notice.push(msg, 10)
    //@ts-ignore
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
        //@ts-ignore
        button_i.ariaHidden = true
        button_a.append(button_i)
        button_a.append(msg)
        button.append(button_a)
        button.onclick = func
        return button
    }
    if (IDs != null) {
        setTimeout(Cloud.recaptcha_init, 1000)
        // IDs = IDs[1]
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
        main.append(create("下载(稳定)", "fa-download", () => {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            var A = new Nhimmeo(IDs[1], "", new Localforage())
            A.load().then(res => { A.reinit() })
        }))
        main.append(document.createElement("br"))
        // main.append(create("修复下载(高速)", "fa-download", function () {
        //     var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
        //     IDs = IDs[1]
        //     var A = new Article(IDs)
        //     A.PrefetchChapter().then(res => { Task.init() })
        // }))
        main.append(create("上传至云端", "fa-cloud-upload", () => {
            if (Cloud.gtoken) { unsafeWindow.grecaptcha.reset() }
            unsafeWindow.grecaptcha.execute()
            Task.add(`Cloud.upload(${IDs[1]})`)
        }))
        main.append(create("修复下载(稳定)", "fa-download", () => {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            var A = new Nhimmeo(IDs[1], "", new Localforage())
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
        main.append(create("下载云端最新文件", "fa-cloud-download", () => {
            // window.notice.push("尚未完工", Notice.ERROR)
            Cloud.fetchlatest(IDs)
        }))
        main.append(create("手动导出(稳定)", "fa-floppy-o", () => {
            var IDs = document.location.href.match(/https:\/\/zh\.nhimmeo\.cf\/book\/(\d+)$/)
            var A = new Nhimmeo(IDs[1], "", new Localforage())
            A.file()
        }))
        main.append(document.createElement("br"))
        main.append(create("清空高速缓存", "fa-times", () => {
            var book_mark = localStorage.getItem("book_mark")
            localStorage.clear()
            localStorage.setItem("book_mark", book_mark)
        }, "secondary"))
        // main.append(document.createElement("br"))
        main.append(create("清空稳定缓存", "fa-times", () => {
            localforage.clear()
        }, "secondary"))
    } else {
        if (document.location.href.includes('chap')) {
            var main = $("div.center")[2]
            main.append(create("终止任务", "fa-times", () => {
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
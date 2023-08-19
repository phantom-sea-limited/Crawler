// ==UserScript==
// @name         Canvas.Download
// @namespace    Rcrwrate
// @version      1.0
// @description  下载章节
// @author       Rcrwrate
// @match        https://viewer.heros-web.com/episode/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=heros-web.com
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// ==/UserScript==

function o(e, t, i) {
    return (t = function (e) {
        var t = function (e, t) {
            if ("object" != typeof e || null === e)
                return e;
            var i = e[Symbol.toPrimitive];
            if (void 0 !== i) {
                var r = i.call(e, t || "default");
                if ("object" != typeof r)
                    return r;
                throw new TypeError("@@toPrimitive must return a primitive value.")
            }
            return ("string" === t ? String : Number)(e)
        }(e, "string");
        return "symbol" == typeof t ? t : String(t)
    }(t)) in e ? Object.defineProperty(e, t, {
        value: i,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = i,
        e
}

function i(t, e, r) {
    return (e = function (t) {
        var e = function (t, e) {
            if ("object" != typeof t || null === t)
                return t;
            var r = t[Symbol.toPrimitive];
            if (void 0 !== r) {
                var i = r.call(t, e || "default");
                if ("object" != typeof i)
                    return i;
                throw new TypeError("@@toPrimitive must return a primitive value.")
            }
            return ("string" === e ? String : Number)(t)
        }(t, "string");
        return "symbol" == typeof e ? e : String(e)
    }(e)) in t ? Object.defineProperty(t, e, {
        value: r,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : t[e] = r,
        t
}

class n {
    constructor(t) {
        i(this, "view", void 0),
            i(this, "lastError", void 0),
            this.view = t,
            this.lastError = null
    }
    setup() { }
    setError(t) {
        this.lastError = t,
            this.view.updateError()
    }
}

class a extends n {
    constructor(e, t) {
        super(e),
            o(this, "DIVIDE_NUM", 4),
            o(this, "MULTIPLE", 8),
            o(this, "width", void 0),
            o(this, "height", void 0),
            o(this, "cell_width", void 0),
            o(this, "cell_height", void 0),
            this.width = t.width,
            this.height = t.height,
            this.cell_width = Math.floor(this.width / (this.DIVIDE_NUM * this.MULTIPLE)) * this.MULTIPLE,
            this.cell_height = Math.floor(this.height / (this.DIVIDE_NUM * this.MULTIPLE)) * this.MULTIPLE
    }
    solve() {
        this.view.drawImage(0, 0, this.width, this.height, 0, 0);
        for (let e = 0; e < this.DIVIDE_NUM * this.DIVIDE_NUM; e++) {
            const t = Math.floor(e / this.DIVIDE_NUM) * this.cell_height
                , i = e % this.DIVIDE_NUM * this.cell_width
                , r = Math.floor(e / this.DIVIDE_NUM)
                , n = e % this.DIVIDE_NUM * this.DIVIDE_NUM + r
                , s = n % this.DIVIDE_NUM * this.cell_width
                , o = Math.floor(n / this.DIVIDE_NUM) * this.cell_height;
            this.view.drawImage(i, t, this.cell_width, this.cell_height, s, o)
        }
    }
}

class _o {
    constructor(t) {
        i(this, "presenter", void 0),
            this.initMembers(t),
            this.presenter = this.createPresenter(),
            this.registerEvents(),
            this.initSubViews(),
            this.presenter.setup()
    }
    initMembers(t) { }
    registerEvents() { }
    initSubViews() { }
    updateError() { }
}

class C extends _o {
    constructor(e) {
        super(e)
    }
    initMembers(e) {
        this.puzzledImage = e,
            this.width = e.naturalWidth,
            this.height = e.naturalHeight,
            this.solvedImage = document.createElement("canvas"),
            this.solvedImage.width = this.width,
            this.solvedImage.height = this.height
    }
    registerEvents() { }
    createPresenter() {
        return new a(this, {
            width: this.width,
            height: this.height
        })
    }
    drawImage(e, t, i, r, s, o) {
        const a = this.solvedImage.getContext("2d");
        a ? (a.imageSmoothingEnabled = !1,
            a.drawImage(this.puzzledImage, e, t, i, r, s, o, i, r)) : l || ((0,
                n.T)(new Error("Failed to getContext")),
                l = !0)
    }
    makeTainted() {
        const e = (0,
            s.PK)();
        if (!e)
            return;
        const t = new Image;
        t.onload = () => {
            var e;
            null === (e = this.solvedImage) || void 0 === e || null === (e = e.getContext("2d")) || void 0 === e || e.drawImage(t, -1, -1, 1, 1)
        }
            ,
            t.src = `${e}/images/spacer.png`
    }
}

function download(blob, filename) {
    var tmp = document.createElement("a");
    tmp.href = URL.createObjectURL(blob)
    tmp.download = filename
    tmp.click()
    URL.revokeObjectURL(tmp.href)
}

async function fetchRawImage(src) {
    var r = await fetch(src)
    var b = await r.blob()
    var img = document.createElement("img")
    img.src = URL.createObjectURL(b)
    return img
}

function transform(Raw, filename) {
    var c = new C(Raw)
    c.presenter.solve()
    c.solvedImage.toBlob((b) => {
        download(b, filename)
    })
}

async function Cover(filename) {
    r = await fetch(document.getElementsByClassName("link-slot")[0].children[0].src)
    b = await r.blob()
    download(b, filename)
}

async function all() {
    function single(src, filename) {
        fetchRawImage(src).then((raw) => {
            raw.onload = () => {
                transform(raw, filename)
            }
        })
    }

    setTimeout(Cover, 0, 0)
    var i = 1
    data.readableProduct.pageStructure.pages.forEach((e) => {
        if (e.src) {
            setTimeout(single, 0, e.src, i)
            i++
        }
    })
}

window.c = C
window.fetchRawImage = fetchRawImage
window.transform = transform
window.Cover = Cover
unsafeWindow.CR = window
data = JSON.parse(document.getElementById("episode-json").dataset['value'])
unsafeWindow.data = data
GM_registerMenuCommand("下载", all)

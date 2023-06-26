# 高级说明

### 前情提要

1. 由于，STV脚本将会跨多个域名，数据存储改为tampermonkey相关函数，tampermonkey函数均采用异步，故Task类改为异步设计

2. 采用新的激活机制，提高效率

3. 由于一旦引入tampermonkey相关函数，tampermonkey就会给脚本一个Proxy运行环境，为了让Task和Article类被泄露至页面，采用了一个奇怪的设计

```js
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
}   // 一些函数层级和调用方式的更改都会导致外泄失效，不知道为什么
```

爬虫核心类为    `window.STV.Article`，任务调度机制为    `window.STV.Task`，均可以在控制台直接使用

额外的`window.STV.window`是爬虫的运行环境(Proxy)

## sangtacviet.user.js

**新增相关方法如下：**

```js
A = new Article(ID, ori)     // ID为书籍ID, ori为来源
await A.translateCatalog()   // 翻译目录
await A.translateInfo()      // 翻译信息
```

[**常规方法说明(nhimmeo)**](https://github.com/phantom-sea-limited/Crawler/blob/main/nhimmeo.md)


### 漏洞说明

```js
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

class Task{
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
}

```

修改了`Task.init`，即任务执行的逻辑

以前使用`window.Task_STOP = true`，任务执行队列就会永久终止，同时，函数内的`await sleep(1000)`会导致一些神奇的问题

~~表现为，在上一段`eval()`未执行完成前就执行下一段(很神秘，实际上你单独去测试，是正常的)~~

(其实也，不能这么说，更严谨的描述应该是：在上一个章节的获取还没完成之前，任务调度系统就已经前往了下一个目的端)

更明确一点来说是，在`document.location.href`更改之后，在新的页面加载前，前一个页面的js将会持续运行


```js
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
async function _(){
    await sleep(1000)
    console.log("sleep")
}
eval (`_().then(res=>{console.log("unsleep")})`)
```

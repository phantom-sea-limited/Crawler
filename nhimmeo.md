# **nhimmeo.cf 刺猬猫分享 高级说明**

## nhimmeo.user.js

高级说明仅面向高级用户(对js有了解)

爬虫核心类为    `window.nhimmeo.Article`，任务调度机制为    `window.nhimmeo.Task`，均可以在控制台直接使用

**相关方法如下：**

```js
A = new Article(ID)     // ID为书籍ID
await A.load()          // 从缓存区间拉取数据(可以忽略此方法，在大部分情景下均会检查是否load)
await A.fetchInfo()     // 获取书籍信息
await A.fetchCatalog()  // 获取书籍目录(会清除所有缓存的章节内容!!!)
await A.PrefetchChapter()
                        // 预处理需要下载的章节，但任务队列不会自动执行
Task.init()             // 读取任务队列，开始执行
await A.file()          // 导出文件
await A.save()          // 保存数据
```

其他方法：

```js
Article.init()          // 初始化函数，在load()中自动执行，用于第一次执行
Article.reinit()        // 手动初始化，用于新增强制刷新所有信息的任务
```

```js
class Article {
    async fetchChapter(i, j){ ... }
    // 章节下载函数，传入的i，j是章节列表的序列号
    output() { ... }
    // 输出数据为json
    static localconfig(key, msg = '') { ... }
    // 数据存取(localStorage)
    static async localforge(key, msg = "") { ... }
    // 数据存取(IndexDB)
}
```

ps: 对于Task相关函数不作过多介绍

```js
class Task {
    static createBymethod(ID, method, mode = "normal") {...}
    static create(ID, lines, mode = "normal") {...}
    // 新建任务

    static add(command, mode = "unshift") {...}
    // 新增任务，模式分别为队尾插入和队列头部插入，默认头部插入
    static init() {...}
    // 执行任务队列
    static localconfig(msg = '') {...}
    // 数据存取(localStorage)
}
```
import { defaultStorge } from "./Storge";

interface Engine {
    new(ID: string, ori: string, storge: defaultStorge): Engine;
}


class Engine implements Engine {
    ID: string
    /** 来源，非重要 */
    ori: string | null = null;
    bookname: string | null = null;
    cover: string | null = null;
    details: string | null = null;
    author: string | null = null;
    tag: string | null = null;
    book_uptime: string | null = null
    chapterList: any = [];
    init_status: boolean = false;
    load_status: boolean = false;
    /** 存储 */
    storge: defaultStorge
    more: { [key: string]: string } = {};

    constructor(ID: string, ori: string, storge: defaultStorge) {
        this.ID = ID;
        this.ori = ori
        this.storge = storge
    }

    /** 初始化中需要添加到任务列表的所有任务 */
    async TaskINIT() {

    }

    async init() {
        this.init_status = true
        await this.TaskINIT()
        /** ?我为什么要在这里保存 */
        await this.save()
        setTimeout(Task.init, 200)
    }

    async reinit() {
        await this.load()
        if (this.init_status != true) {
            await this.TaskINIT()
            setTimeout(Task.init, 200)
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
            var tmp = await this.config(this.ID)
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
        await this.config(this.ID, this.output())
    }

    async config(key: string, msg: "" | { [key: string]: string | any } = ''): Promise<{ [key: string]: any }> {
        if (msg === '') {
            return JSON.parse(await this.storge.get(key) ?? "{}") as { [key: string]: any }
        } else {
            await this.storge.set(key, JSON.stringify(msg))
            return {}
        }
    }
}

export { Engine }
import { LocalStorage, defaultStorge } from "./Storge"

class Task {
    storge: defaultStorge
    constructor(storge: defaultStorge = new LocalStorage()) {
        this.storge = storge
    }

    createBymethod(ID: string, ori: string | null, method: string, mode: string) {
        return `
            var A = new Article(${ID},\"${ori}\",new ${mode}())
            A.${method}().then(res=>{A.save()})`
    }

    create(ID: string, ori: string | null, lines: string[], mode: string) {
        function _(lines: string[]) {
            var command = ""
            lines.forEach(element => {
                command += element + "\n"
            })
            return command
        }
        return `
            var A = new Article(${ID},\"${ori}\",new ${mode}())
            async function _(){
                ${_(lines)}
            }
            _().then(res=>{A.save()})`
    }

    async localconfig(msg: "" | string[] = "") {
        if (msg === '') {
            return JSON.parse(await this.storge.get("Task") ?? "[]") as string[]
        } else {
            await this.storge.set("Task", JSON.stringify(msg))
            return []
        }
    }

    async add(command: string | string[], mode = "unshift") {
        var commands = window.Task_info ?? await this.localconfig()
        if (commands == null) { commands = [] }
        if (typeof (command) == 'object') {
            command.forEach(element => {
                if (mode == "unshift") { commands.unshift(element) } else { commands.push(element) }
            })
        } else {
            if (mode == "unshift") { commands.unshift(command) } else { commands.push(command) }
        }
        await this.localconfig(commands)
    }

    async init() {
        if (window.Task_info == undefined) {
            window.Task_info = await this.localconfig()
        }
        const commands = window.Task_info
        var command;
        if (commands != null) {
            if (commands.length != 0) {
                if (window.Task_STOP != true) {
                    command = commands.pop()
                    eval(command)
                    window.notice.push(command, window.Notice.DEBUG)
                    await this.localconfig(commands)
                }
                setTimeout(this.init, 1000)
            }
        }
        window.notice.push("Task finish! waiting for another", window.Notice.DEBUG)
    }
}


class TaskStatic {
    static createBymethod(ID: string, ori: string | null, method: string, mode: string) {
        return `
            var A = new Article(${ID},\"${ori}\",new ${mode}())
            A.${method}().then(res=>{A.save()})`
    }

    static create(ID: string, ori: string | null, lines: string[], mode: string) {
        function _(lines: string[]) {
            var command = ""
            lines.forEach(element => {
                command += element + "\n"
            })
            return command
        }
        return `
            var A = new Article(${ID},\"${ori}\",new ${mode}())
            async function _(){
                ${_(lines)}
            }
            _().then(res=>{A.save()})`
    }

    static async localconfig(msg: "" | string[] = "") {
        if (msg === '') {
            return JSON.parse(await window.Task_storge.get("Task") ?? "[]") as string[]
        } else {
            await window.Task_storge.set("Task", JSON.stringify(msg))
            return []
        }
    }

    static async add(command: string | string[], mode = "unshift") {
        var commands = window.Task_info ?? await TaskStatic.localconfig()
        if (commands == null) { commands = [] }
        if (typeof (command) == 'object') {
            command.forEach(element => {
                if (mode == "unshift") { commands.unshift(element) } else { commands.push(element) }
            })
        } else {
            if (mode == "unshift") { commands.unshift(command) } else { commands.push(command) }
        }
        await TaskStatic.localconfig(commands)
    }

    static async init() {
        if (window.Task_info == undefined) {
            window.Task_info = await TaskStatic.localconfig()
        }
        const commands = window.Task_info
        var command;
        if (commands != null) {
            if (commands.length != 0) {
                if (window.Task_STOP != true) {
                    command = commands.pop()
                    eval(command)
                    window.notice.push(command, window.Notice.DEBUG)
                    await this.localconfig(commands)
                }
                setTimeout(this.init, 1000)
            }
        }
        window.notice.push("Task finish! waiting for another", window.Notice.DEBUG)
    }
}

export { TaskStatic as Task }
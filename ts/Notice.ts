import SnackBar = require("./js-snackbar.min.js")

type mode = "C" | "G" | "S"
window.SnackBar = SnackBar
class Notice {
    static DEBUG: 0 = 0
    static INFO: 10 = 10
    static WARNING: 20 = 20
    static ERROR: 30 = 30
    static Critical: 40 = 40
    static NoLog: 50 = 50
    static console: mode = "C"
    static GM_log: mode = "G"
    static snackbar: mode = "S"
    c_tr = { 0: "debug", 10: "info", 20: "warn", 30: "error", 40: "error" }
    g_tr = { 0: "[DEBUG]", 10: "[INFO]", 20: "[WARN]", 30: "[ERROR]", 40: "[Critical]" }
    // s_tr = { 0: "grey", 10: "blue", 20: "warn", 30: "error", 40: "error" }
    s_tr = { 0: "info", 10: "green", 20: "warning", 30: "danger", 40: "danger" }
    loglevel: number
    method: mode[]

    constructor(loglevel: number = Notice.INFO, method: mode[] = [Notice.GM_log, Notice.console, Notice.snackbar]) {
        this.loglevel = loglevel
        this.method = method
    }

    push(msg: string, level: number) {
        if (level >= this.loglevel) {
            this.method.forEach((e) => {
                this[e](msg, level)
            })
        }
    }

    G(msg, level) {
        GM_log(`${this.g_tr[level]}\t${msg}`)
    }

    C(msg, level) {
        console[this.c_tr[level]](msg)
    }

    S(msg, level) {
        // $.snackbar({
        //     content: msg, // text of the snackbar
        //     style: `toast ${this.s_tr[level]}`, // add a custom class to your snackbar
        //     timeout: 1000 // time in milliseconds after the snackbar autohides, 0 is disabled
        // })
        window.SnackBar({
            message: msg,
            status: this.s_tr[level],
            fixed: true
        })
    }
}


window.Notice = Notice

export { Notice }
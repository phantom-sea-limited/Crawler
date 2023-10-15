import { cloud } from "./Cloud"
import { Engine } from "./Engine"
import { Notice } from "./Notice"
import { defaultStorge } from "./Storge"
import { Task as TaskStatic } from "./Task"

declare global {
    /** @deprecated Use window.lodash instead. */


    interface GitInfo {
        commitHash: string
        branch: string
        nearestTag: string
        versionWithTag: string
    }
    interface CompilationInfo extends GitInfo {
        year: string
        version: string
        // buildTime: number
    }
    const webpackCompilationInfo: CompilationInfo
    const webpackGitInfo: GitInfo

    const BwpElement: {
        new(): HTMLVideoElement
        prototype: HTMLVideoElement
    }

    interface Window {
        Task_info: string[] | undefined
        Task_STOP: boolean
        SnackBar: SnackBar
        notice: Notice
        Notice: {
            DEBUG: 0
            INFO: 10
            WARNING: 20
            ERROR: 30
            Critical: 40
            NoLog: 50
        }
        Task: any = Task
        Task_storge: defaultStorge
        nhimmeo: any
        Article: Engine
        [key: string]: any
    }

    const unsafeWindow: Window & typeof globalThis

    interface MonkeyXhrResponse {
        finalUrl: string
        readyState: number
        status: number
        statusText: string
        responseHeaders: any
        response: any
        responseXML: Document
        responseText: string
    }
    interface MonkeyXhrBasicDetails {
        url: string
        method?: 'GET' | 'POST' | 'HEAD'
        headers?: { [name: string]: string }
        data?: string
        cookie?: string
        binary?: boolean
        nocache?: boolean
        revalidate?: boolean
        timeout?: number
        context?: any
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text'
        overrideMimeType?: string
        anonymous?: boolean
        fetch?: boolean
        user?: string
        password?: string
    }
    interface MonkeyXhrDetails extends MonkeyXhrBasicDetails {
        onabort?: (response: MonkeyXhrResponse) => void
        onerror?: (response: MonkeyXhrResponse) => void
        onloadstart?: (response: MonkeyXhrResponse) => void
        onprogress?: (response: MonkeyXhrResponse) => void
        onreadystatechange?: (response: MonkeyXhrResponse) => void
        ontimeout?: (response: MonkeyXhrResponse) => void
        onload?: (response: MonkeyXhrResponse) => void
    }
    type RunAtOptions =
        | 'document-start'
        | 'document-end'
        | 'document-idle'
        | 'document-body'
        | 'context-menu'
    interface MonkeyInfo {
        script: {
            author: string
            copyright: string
            description: string
            excludes: string[]
            homepage: string
            icon: string
            icon64: string
            includes: string[]
            lastUpdated: number
            matches: string[]
            downloadMode: string
            name: string
            namespace: string
            options: {
                awareOfChrome: boolean
                compat_arrayleft: boolean
                compat_foreach: boolean
                compat_forvarin: boolean
                compat_metadata: boolean
                compat_prototypes: boolean
                compat_uW_gmonkey: boolean
                noframes: boolean
                override: {
                    excludes: false
                    includes: false
                    orig_excludes: string[]
                    orig_includes: string[]
                    use_excludes: string[]
                    use_includes: string[]
                }
                run_at: RunAtOptions
            }
            position: number
            resources: string[]
            'run-at': RunAtOptions
            system: boolean
            unwrap: boolean
            version: string
        }
        scriptMetaStr: string
        scriptSource: string
        scriptUpdateURL: string
        scriptWillUpdate: boolean
        scriptHandler: string
        isIncognito: boolean
        version: string
    }
    const GM_info: MonkeyInfo
    function GM_xmlhttpRequest(details: MonkeyXhrDetails): { abort: () => void }
    function GM_setValue<T>(name: string, value: T): void
    function GM_getValue<T>(name: string, defaultValue?: T): T
    function GM_deleteValue(name: string): void
    function GM_getResourceText(name: string): string
    function GM_getResourceURL(name: string): string
    function GM_registerMenuCommand(
        name: string,
        callback: (event: MouseEvent | KeyboardEvent) => void,
        accessKey?: string,
    ): string
    function GM_unregisterMenuCommand(menuId: string): void

    interface GM {
        getValue: (key: string, defaultvalue?: string | undefined) => Promise<string>
        setValue: (key: string, data: string) => Promise<void>
    }
    let GM: GM
    let GM_log: (message: string) => void
    let Task = TaskStatic
    let grecaptcha = {
        execute: Function,
        reset: Function
    }
    let Cloud: cloud
}
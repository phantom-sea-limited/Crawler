import { Engine } from "./Engine"
import { defaultStorge } from "./Storge"

//insert JS into Page
function install(func: Function) {
    var s = document.createElement("script")
    s.type = "text/javascript"
    s.innerHTML = func.toString()
    document.body.append(s)
}

function recaptcha_callback(e) {
    unsafeWindow.notice.push("人机验证成功!正在上传文件", unsafeWindow.Notice.INFO)
    unsafeWindow.Cloud.gtoken = e
    unsafeWindow.Task_STOP = false
    unsafeWindow.Task.init()
}

class cloud {
    chunkSize: number = 5 * 1024 * 1024   // 5MB 切片大小，根据需要进行调整
    init: boolean = false
    gtoken: string | undefined = undefined
    uploadSessionUrl: string | undefined = undefined
    unsafewindow: string
    sitekey: string
    constructor(unsafewindow: string, sitekey: string) {
        this.unsafewindow = unsafewindow
        this.sitekey = sitekey
    }

    file(Article: Engine) {
        const jsonString = JSON.stringify(Article.output());
        return new Blob([jsonString], { type: 'application/json' });
    }

    UploadTask(ID: string, ori: string, mode: string) {
        install(function recaptcha_init_Callback() { grecaptcha.execute() })
        Task.add(`Cloud.upload(${ID}, "${ori}", "${mode}")`)
        this.recaptcha_init()
        window.Task_STOP = true
        window.notice.push("正在将结果上传至云端,用于分享给其他用户,感谢您的慷慨", window.Notice.INFO)
    }

    recaptcha_init() {
        if (!this.init) {
            var key = document.createElement("div")
            key.dataset["sitekey"] = this.sitekey
            key.dataset["size"] = "invisible"
            key.dataset['callback'] = recaptcha_callback.prototype.constructor.name
            key.classList.add("g-recaptcha")
            document.body.append(key)

            var s = document.createElement("script")
            s.type = "text/javascript"
            //@ts-ignore
            s.innerHTML = recaptcha_callback.toString().replaceAll("unsafeWindow", this.unsafewindow)
            document.body.append(s)
            // install(recaptcha_callback)

            var js = document.createElement('script')
            js.src = `https://www.recaptcha.net/recaptcha/api.js?onload=${recaptcha_callback.prototype.constructor.name}`
            document.body.append(js)
            this.init = true
        }
    }

    upload(ID, ori, mode: defaultStorge) {
        const A = new window.Article(ID, ori, mode)
        A.load().then(() => { this.createUploadSession(A) })
    }

    createUploadSession(Article: Engine) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.phantom-sea-limited.ltd/release/Cloud/v2/nhimmeo/upload?gtoken=${this.gtoken}&id=${Article.ID}`,
            headers: {
                "Accept": "text/json"
            },
            onload: (response) => {
                window.notice.push(response.responseText, window.Notice.DEBUG)
                if (response.status == 200) {
                    const r = JSON.parse(response.responseText)
                    this.uploadChunks(r.uploadUrl, Article, this.chunkSize)
                }
            }
        });
    }

    fetchlatest(ID) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.phantom-sea-limited.ltd/release/Cloud/v1/nhimmeo/download?id=${ID}`,
            headers: {
                "Accept": "text/json"
            },
            onload: function (response) {
                window.notice.push(response.responseText, window.Notice.DEBUG)
                if (response.status == 200) {
                    const r = JSON.parse(response.responseText)
                    if (r['@microsoft.graph.downloadUrl']) {
                        window.notice.push("已找到到云端数据,正在下载", window.Notice.INFO)
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: r['@microsoft.graph.downloadUrl'],
                            onload: function (response) {
                                if (response.status == 200) {
                                    window.localforage.setItem(ID, response.response)
                                    window.notice.push("下载成功，已自动导入", window.Notice.INFO)
                                } else {
                                    window.notice.push("下载失败，请稍后重试", window.Notice.ERROR)
                                }
                            }
                        });
                    } else {
                        window.notice.push("未找到云端数据", window.Notice.ERROR)
                    }
                }
            }
        });
    }

    // 将文件切片成指定大小的块
    static sliceFile(file, chunkSize) {
        const slices = [];
        let start = 0;
        while (start < file.size) {
            slices.push(file.slice(start, start + chunkSize));
            start += chunkSize;
        }
        return slices;
    }

    // 开始上传切片
    uploadChunks(uploadSessionUrl, Article, chunkSize) {
        var file = this.file(Article)
        const slices = cloud.sliceFile(file, chunkSize);
        let index = 0;

        function uploadNextChunk() {
            if (index >= slices.length) {
                window.notice.push('文件上传完成,感谢您的慷慨', window.Notice.INFO);
                return;
            }

            const currentChunk = slices[index];
            const chunkStart = index * chunkSize;
            const chunkEnd = chunkStart + currentChunk.size - 1;

            const headers = {
                'Content-Range': `bytes ${chunkStart} -${chunkEnd} /${file.size}`,
                'Content-Length': currentChunk.size,
            };

            fetch(uploadSessionUrl, {
                method: 'PUT',
                headers,
                body: currentChunk,
            })
                .then(response => {
                    if (!response.ok) {
                        window.notice.push(`Chunk upload failed: ${response.status} ${response.statusText}`, window.Notice.ERROR);
                        throw new Error(`Chunk upload failed: ${response.status} ${response.statusText}`);
                    }
                    window.notice.push(`Uploaded chunk ${index + 1}/${slices.length}`, window.Notice.DEBUG);
                    index++;
                    uploadNextChunk();
                })
                .catch(error => {
                    window.notice.push(`Chunk upload failed: ${error}`, window.Notice.ERROR);
                });
        }
        uploadNextChunk();
    }
}


export { cloud }
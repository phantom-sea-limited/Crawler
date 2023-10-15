import localforage from "localforage"

class defaultStorge {
    async get(key: string): Promise<string | undefined> {
        return undefined
    }

    async set(key: string, data: string): Promise<string | undefined> {
        return undefined
    }

    lower(): defaultStorge | null {
        return null
    }
}

class LocalStorage extends defaultStorge {
    async get(key: string): Promise<string | undefined> {
        return localStorage.getItem(key) ?? undefined
    }

    async set(key: string, data: string) {
        localStorage.setItem(key, data)
        return undefined
    }

    lower(): defaultStorge | null {
        return null
    }
}

class Localforage extends defaultStorge {
    async get(key: string): Promise<string | undefined> {
        return localforage.getItem(key) ?? undefined
    }

    async set(key: string, data: string) {
        return localforage.setItem(key, data)
    }

    lower(): defaultStorge | null {
        return new LocalStorage()
    }
}

class GMStorge extends defaultStorge {
    async get(key: string): Promise<string | undefined> {
        return await GM.getValue(key, undefined) ?? undefined
    }

    async set(key: string, data: string) {
        await GM.setValue(key, data)
        return undefined
    }

    lower(): defaultStorge | null {
        return new Localforage()
    }
}

export { defaultStorge, LocalStorage, Localforage, GMStorge }
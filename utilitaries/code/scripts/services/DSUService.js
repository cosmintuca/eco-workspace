export default class DSUService {

    PATH = "/";

    constructor(DSUStorage, path) {
        this.DSUStorage = DSUStorage;
        this.PATH = path;
    }

    getEntities(path, callback) {
        if (typeof path === 'function') {
            callback = path;
            path = this.PATH;
        }
        this.DSUStorage.call('listDSUs', path, (err, dsuList) => {
            if (err) {
                return callback(err, undefined);
            }
            let entities = [];
            let getServiceDsu = (dsuItem) => {
                this.DSUStorage.getItem(this._getDsuStoragePath(dsuItem.identifier, path), (err, content) => {
                    if (err) {
                        entities.slice(0);
                        return callback(err, undefined);
                    }
                    let textDecoder = new TextDecoder("utf-8");
                    let entity = JSON.parse(textDecoder.decode(content));
                    entities.push(entity);

                    if (dsuList.length === 0) {
                        return callback(undefined, entities);
                    }
                    getServiceDsu(dsuList.shift());
                })
            };

            if (dsuList.length === 0) {
                return callback(undefined, []);
            }
            getServiceDsu(dsuList.shift());
        })
    }

    getEntity(uid, path, callback) {
        if (typeof path === 'function') {
            callback = path;
            path = this.PATH;
        }
        this.DSUStorage.getItem(this._getDsuStoragePath(uid, path), (err, content) => {
            if (err) {
                return callback(err, undefined);
            }
            let textDecoder = new TextDecoder("utf-8");
            callback(undefined, JSON.parse(textDecoder.decode(content)));
        })
    }

    saveEntity(entity, path, callback) {
        if (typeof path === 'function') {
            callback = path;
            path = this.PATH;
        }
        this.DSUStorage.call('createSSIAndMount', path, (err, keySSI) => {
            if (err) {
                return callback(err, undefined);
            }
            entity.KeySSI = keySSI;
            entity.uid = keySSI;
            this.updateEntity(entity, path, callback);
        })
    }

    updateEntity(entity, path, callback) {
        if (typeof path === 'function') {
            callback = path;
            path = this.PATH;
        }
        this.DSUStorage.setObject(this._getDsuStoragePath(entity.uid, path), entity, (err) => {
            if (err) {
                return callback(err, undefined);
            }
            callback(undefined, entity);
        })
    }

    mountEntity(keySSI, callback, path = this.PATH) {
        this.DSUStorage.call('mount', path, keySSI, (err) => {
            this.getEntity(keySSI, (err, entity) => {
                if (err) {
                    return callback(err, undefined);
                }
                callback(undefined, entity);
            })
        })
    }

    unmountEntity(uid, callback, path = this.PATH) {
        let unmountPath = path + '/' + uid;
        this.DSUStorage.call('unmount', unmountPath, (err, result) => {
            if (err) {
                return callback(err, undefined);
            }
            callback(undefined, result);
        });
    }

    _getDsuStoragePath(keySSI, path = this.PATH) {
        return path + '/' + keySSI + '/data.json';
    }
}
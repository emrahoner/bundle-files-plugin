const path = require('path');
const fs = require('fs');

const plugin = { name: 'BundleFilesPlugin' };

function readFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, contents) => {
            if(err) {
                reject(err);
            } else {
                resolve(contents);
            }
        });
    });
}

function hookAsync(obj, event, func) {
    if(obj.hooks) {
        obj.hooks[event].tapAsync(plugin, func);
    } else {
        obj.plugin(event, func);
    }
}

module.exports = class BundleFilesPlugin {

    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        hookAsync(compiler, 'emit', (compilation, callback) => {
            Promise.all(this.options.files.map(file => readFile(path.join(compiler.context, file)))).then((contents) => {
                let buffer = '';
                contents.forEach(content => {
                    buffer += content;
                });
                compilation.assets[this.options.name] = {
                    source: () => {
                        return new Buffer(buffer);   
                    },
                    size: () => { 
                        return Buffer.byteLength(buffer); 
                    }
                };
                callback();
            });
        });
    }
}
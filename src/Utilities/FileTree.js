
import React from 'react';
var remote = window.require('electron').remote;
var electronFs = remote.require('fs');

export default class FileTree {
    constructor(path, name = null){
        this.path = path;
        this.name = name;
        this.items = [];
    }

    build = () => {
        this.items = FileTree.readDir(this.path);
    }

    renderUnorderedList = () => {
        return FileTree.renderUnorderedListHtml(this.items);
    }

    static renderUnorderedListHtml(files) {
        return (
            <ul>
                {files.map((file, i) => {
                    return (
                        <li key={i}>
                            <span>{file.name}</span>
                            {file.items.length > 0 &&
                                FileTree.renderUnorderedListHtml(file.items)
                            }
                        </li>
                    )
                })}
            </ul>
        )
    }

    static readDir(path) {
        var fileArray = [];

        electronFs.readdirSync(path).forEach(file => {
            var fileInfo = new FileTree(`${path}\\${file}`, file);

            var stat = electronFs.statSync(fileInfo.path);

            if (stat.isDirectory()){
                fileInfo.items = FileTree.readDir(fileInfo.path);
            }

            fileArray.push(fileInfo);
        })

        return fileArray;
    }
}
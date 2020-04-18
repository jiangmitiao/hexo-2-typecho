const fs = require('hexo-fs');

// 对应typecho中的metas 其中包含tag和category
const metas = {
    mid: 10,
    tagMap: new Map(),
    categoryMap: new Map()
};
// 添加标签方法
metas.addTag = function (tag) {
    if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, {name: tag, slug: tag, type: 'tag', count: 0, mid: ++this.mid});
    }
    let t = this.tagMap.get(tag);
    t.count += 1;
    this.tagMap.set(tag, t);
    return t.mid;
};
// 添加类目方法
metas.addCategory = function (category) {
    if (!this.categoryMap.has(category)) {
        this.categoryMap.set(category, {name: category, slug: category, type: 'category', count: 0, mid: ++this.mid});
    }
    let t = this.categoryMap.get(category);
    t.count += 1;
    this.categoryMap.set(category, t);
    return t.mid;
};

// 对应typecho中的relationships
const relation = {
    r: []
};
// 添加关系方法
relation.add = function (mid, cid) {
    this.r.push({
        mid: mid,
        cid: cid
    });
};

// 对应typecho中contents 内容对象
const contents = {
    // 用于attachment类型数据添加
    mimeTypeMap: new Map(),
    // 当前处理文章内容
    current: {},
    cid: 10,
    inner: [],
};
contents.mimeTypeMap.set("png", "image/png");
contents.mimeTypeMap.set("jpg", "image/jpg");
contents.getMimeType = function (ext) {
    return this.mimeTypeMap.get(ext) != null ? this.mimeTypeMap.get(ext) : ext;
};
contents.setCurrent = function (current) {
    this.current = current;
};
contents.getCurrent = function () {
    return this.current;
};
contents.newCid = function () {
    this.cid += 1;
    return this.cid;
};
contents.push = function (item) {
    this.inner.push(item);
};


// hexo相关初始化
const config = hexo.config;
let typecho = config.typecho;

if (typecho == null) {
    // 如果没有做typecho的配置，则默认设置作者id是1，照片地址在images下。
    typecho = {
        authorId: 1,
        images: "images",
        mid: 10,
        cid: 10
    };
}
if (!typecho.authorId) {
    typecho.authorId = 1;
}
if (!typecho.images) {
    typecho.images = "images";
}
if (!typecho.mid) {
    typecho.mid = 10;
}
if (!typecho.cid) {
    typecho.cid = 10;
}


// 生成器注册
hexo.extend.generator.register('post', function (locals) {
    //console.log(locals);
    locals.posts = locals.posts.sort("+date");
    locals.posts.forEach(p => {
        postProcess(p)
    });

    locals.pages = locals.pages.sort("+date");
    locals.pages.forEach(p => {
        pageProcess(p)
    });
});

// 文章处理
function postProcess(data) {
    let data1 = {
        cid: contents.newCid(),
        title: data.title,
        slug: data.slug,
        created: Math.floor(data.date.valueOf() / 1000),
        modified: Math.floor(data.updated.valueOf() / 1000),
        //text: data.content,
        order: 0,
        authorId: typecho.authorId,
        template: null,
        type: data.layout,
        status: data.published ? 'publish' : 'waiting',
        password: null,
        commentsNum: 0,
        allowComment: 1,
        allowPing: 1,
        allowFeed: 1,
        parent: 0
    };
    data1.text = "<!--markdown-->" + data._content;
    contents.push(data1);
    // 标签处理
    if (data.tags != null && data.tags.data != null) {
        data.tags.data.forEach(t => {
            let mid = metas.addTag(t.name);
            relation.add(mid, data1.cid)
        });
    }
    // 类目处理
    if (data.categories != null && data.categories.data != null) {
        data.categories.data.forEach(t => {
            let mid = metas.addCategory(t.name);
            relation.add(mid, data1.cid)
        });
    }

    // 图片处理
    contents.setCurrent(data1);
    let a = ["\\((\\/" + typecho.images + "\\/.*)\\)"];
    let re = new RegExp(a[0], "g");
    data1.text = data1.text.replace(re, singlePicProcess)

}


function singlePicProcess(arg1, arg2) {
    let fileName = Utils.getBaseName(arg2) + "." + Utils.getExt(arg2);
    let ext = Utils.getExt(arg2);
    let mime = contents.getMimeType(ext);
    let srcPath = "source" + arg2;
    let destPath = "typecho/usr/uploads/hexo/" + contents.getCurrent().cid + "/" + fileName;
    let tablePath = "/usr/uploads/hexo/" + contents.getCurrent().cid + "/" + fileName;
    let markdownPath = "(/usr/uploads/hexo/" + contents.getCurrent().cid + "/" + fileName + ")";
    fs.copyFile(srcPath, destPath, err => {
        if (err) {
            console.log("复制失败!!!!!!!!", srcPath, destPath, err);
        } else {
            console.log("复制成功", srcPath, destPath);
        }
    });
    let size = fs.readFileSync(srcPath).size;
    let att = {
        cid: contents.newCid(),
        title: fileName,
        slug: contents.getCurrent().cid + "/" + fileName,
        created: new Date().getTime(),
        modified: new Date().getTime(),
        text: `a:5:{s:4:"name";s:${fileName.length}:"${fileName}";s:4:"path";s:${tablePath.length}:"${tablePath}";s:4:"size";i:${size};s:4:"type";s:3:"${ext}";s:4:"mime";s:${mime.length}:"${mime}";}`,
        order: 0,
        authorId: typecho.authorId,
        template: null,
        type: 'attachment',
        status: 'publish',
        password: null,
        commentsNum: 0,
        allowComment: 1,
        allowPing: 0,
        allowFeed: 1,
        parent: contents.getCurrent().cid
    };
    contents.push(att);

    return markdownPath;
}


function pageProcess(data) {
    let data1 = {
        cid: contents.newCid(),
        title: data.title,
        slug: data.title,
        created: Math.floor(data.date.valueOf() / 1000),
        modified: Math.floor(data.updated.valueOf() / 1000),
        //text: data.content,
        order: 0,
        authorId: typecho.authorId,
        template: null,
        type: data.layout,
        status: data.published ? 'publish' : 'waiting',
        password: null,
        commentsNum: 0,
        allowComment: 1,
        allowPing: 1,
        allowFeed: 1,
        parent: 0
    };
    data1.text = "<!--markdown-->" + data._content;
    contents.push(data1);
}


// 打印信息
hexo.extend.filter.register('after_generate', function () {
    // console.log("得到的类目有：", metas.categoryMap);
    // console.log("得到的标签有：", metas.tagMap);
    // console.log("得到的关系有：", relation.r);
});


// 文章页面产出
hexo.extend.filter.register('after_generate', function () {
    try {
        fs.writeFile("./typecho/contents.json", JSON.stringify(contents.inner), err => {
            if (err) {
                console.error(err);
            } else {
                console.log("导出文章页面成功");
            }
        })
    } catch (err) {
        console.error(err);
    }
});

// 文章meta信息产出
hexo.extend.filter.register('after_generate', function () {

    function _strMapToObj(strMap) {

        let obj = [];
        for (let [k, v] of strMap) {
            obj.push(v);
        }
        return obj;
    }

    try {
        let d1 = _strMapToObj(metas.tagMap);
        d1.push(..._strMapToObj(metas.categoryMap));
        fs.writeFile("./typecho/metas.json", JSON.stringify(d1), err => {
            if (err) {
                console.error(err);
            } else {
                console.log("导出meta成功");
            }
        });
    } catch (err) {
        console.error(err);
    }
});

// 关系产出
hexo.extend.filter.register('after_generate', function () {
    try {
        fs.writeFile("./typecho/relation.json", JSON.stringify(relation.r), err => {
            if (err) {
                console.error(err);
            } else {
                console.log("导出关系成功");
            }
        })
    } catch (err) {
        console.error(err);
    }
});


const Utils = {};
Utils.getBaseName = function (path) {
    let pos = path.lastIndexOf("\/");
    let pos2 = path.lastIndexOf(".");
    return path.substring(pos + 1, pos2);
};


Utils.getExt = function (path) {
    let pos2 = path.lastIndexOf(".");
    return path.substring(pos2 + 1);
};


console.log("加载完成");


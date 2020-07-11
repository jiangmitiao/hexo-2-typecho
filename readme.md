## 介绍

适用于将博客从hexo迁移至typecho。

功能：

* 支持文章、页面、类目、标签、图片的迁移
* 支持作者配置
* 支持typecho中的mid、cid起始位置配置


## 使用说明

功能比较简陋，欢迎大家fork/pr。

### 安装

```shell
npm install --save hexo-2-typecho
```

### 配置

默认情况下:

* typecho的authorId为1
* typecho的cid和mid均为10
* hexo图片的默认保存位置是`source`文件下的`images`文件夹中

什么时候需要修改?

* 如果你的typecho有多个用户的情况下，你可以查看typecho数据库，选出一个作者id。
* 如果你的typecho已经写了不少博客，你需要查看typecho中cid和mid最大值是多少，然后将配置的cid和mid分别+1。
* 使用hexo-admin写作图片一般保存在`images`文件夹中，如果你的图片存在别的文件夹下，则需要修改。另外，目前不支持文件夹下再挂文件夹的情况。

如何修改?

在`_config.yml`中增加以下配置，修改对应值即可

```yaml
typecho:
	authorId: 1
	images: 'images'
	mid: 10
	cid: 10
```

### 生成

调用`hexo g`命令，会在目录下生成`typecho`文件夹。

文件夹中的文件如下：

```shell
typecho
├── contents.json
├── contents.sql
├── metas.json
├── metas.sql
├── relationships.json
├── relationships.sql
└── usr
    └── uploads
        └── hexo
```

其中`contents.json`和`contents.sql`对应typecho的contents表，`metas.json`和`metas.sql`对应typecho的metas表，`relationships.json`和`relationships.sql`对应typecho的relationships表。

usr文件夹中存储的是转移好的图片。

### 后续操作

使用usr文件夹覆盖typecho中的usr文件夹

```shell
# 进入到hexo/typecho文件夹下 将usr文件复制到typecho中即可
cp -R -f usr /xxx/typecho/
```

#### JSON文件导入

使用`Navicat`将json数据导入到typecho中对应的表，当然你也可以使用别的软件，但是我还是建议你使用`Navicat`。

#### SQL文件导入

这是最新加入的功能，最新版本生成了SQL文件，你可以直接将上边的三个SQL文件导入数据库。

使用sql文件直接写入数据库时，请注意调整max_allowed_packet参数，否则会报2006错误。linux下配置文件一般是`/etc/my.cnf`。




## 最后

祝你使用顺利


更多迁移事项，参考：[记从Hexo迁移到Typecho](https://blog.gavinzh.com/2020/04/04/Migrating-Typecho-from-hexo/)


## 版本说明

* 1.0.3 支持直接生成SQL文件，另外修复了mid、cid配置不生效问题。
* 1.0.2 支持JSON文件生成


var Minio = require('minio')

var bucketExistsOrCreate = function (client, bucket) {
    return new Promise((fulfill, reject) => {
        client.bucketExists(bucket, err => {
            if (err) {
                if (err.code != 'NoSuchBucket') {
                    return reject(`error checking bucket existence: ${err}`)
                }
                client.makeBucket(bucket, '', err => {
                    if (err) {
                        return reject(`error making bucket: ${err}`)
                    }
                    fulfill()
                })
            }
            fulfill()
        })
    })
}


module.exports = function (context, params) {
    // var moduleexports = function (context, params) {

    let bucket = context.secrets["bucket"]
    let post = params["post"]
    let client = new Minio.Client({
        "endPoint": context.secrets["endPoint"],
        "port": parseInt(context.secrets["port"]),
        "secure": false,
        "accessKey": context.secrets["accessKey"],
        "secretKey": context.secrets["secretKey"]
    })

    console.log(`minio input params ${JSON.stringify(params)}`)
    // console.log(`minio bucket ${bucket}`)
    return new Promise((fulfill, reject) => {
        bucketExistsOrCreate(client, bucket).then(() => {
            console.log(`bucket existence check passed`)
            listPosts(client, bucket).then((posts) => {
                console.log(`get posts ${JSON.stringify(posts)}`)
                fulfill({ posts: posts })
            }).catch((err) => {
                console.log(err)
                reject({ error: err })
            })
        }).catch(err => {
            console.log(err)
            reject({ error: err })
        })
    })

    // return new Promise((fulfill, reject) => {
    //     console.log(`list posts`)
    //     listPosts(client, bucket, function (err, data) {
    //         if (err) {
    //             reject({ error: `error listing post ${err}` })
    //         } else {
    //             console.log(`listing posts: done.`)
    //             fulfill({ error: null })
    //         }
    //     })
    // })
};

exports.listPosts = function (client, bucket, callback) {

    var posts = []
    var stream = client.listObjects(bucket, '', false)
        .on('data', obj => {
            getPost(client, bucket, { id: obj.name }, (err, post) => {
                if (err) {
                    callback(`error listing posts: ${err}`, null)
                }
                posts.push(post)
                console.log(`push post ${JSON.stringify(post)}`)
            })
        }).on('error', err => {
            callback(`error listing posts: ${err}`, null)
        }).on('end', () => {
            callback(null, posts)
        })
}

var main = function () {
    context = {
        secrets: {
            minio: {
                endPoint: '192.168.99.102',
                port: 31515,
                secure: false,
                accessKey: 'AKIAIOSFODNN7EXAMPLE',
                secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
            },
            bucket: "post-bucket"
        }
    }

    moduleexports(context, {})
        .catch(function (e) {
            console.log(`exception: ${e}`)
        }).then(function (result) {
            console.log(result)
        })
}()
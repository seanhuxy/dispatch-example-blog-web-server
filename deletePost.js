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

    return new Promise((fulfill, reject) => {
        bucketExistsOrCreate(client, bucket).then(() => {
            console.log(`bucket existence check passed`)
            deletePost(client, bucket, post).then((post) => {
                console.log(`delete post ${JSON.stringify(post)}`)
                fulfill({ post: post })
            }).catch((err) => {
                console.log(err)
                reject({ error: err })
            })
        }).catch(err => {
            console.log(err)
            reject({ error: err })
        })
    })
}


var deletePost = function (post, callback) {
    return new Promise((fulfill, reject) => {
        client.removeObject(bucket, post.id, (err) => {
            if (err) {
                return reject(`error removing post: ${err}`)
            }
            fulfill(post)
        })
    })
}
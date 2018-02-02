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
    // console.log(`minio bucket ${bucket}`)

    return new Promise((fulfill, reject) => {
        bucketExistsOrCreate(client, bucket).then(() => {
            console.log(`bucket existence check passed`)
            listPosts(client, bucket).then((posts) => {
                console.log(`list posts ${JSON.stringify(posts)}`)
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
};

var getPost = function (client, bucket, post) {

    return new Promise((fulfill, reject) => {
        client.getObject(bucket, post.id, (err, stream) => {
            data = ""
            if (err) {
                return reject(`error getting object: ${err}`)
            }
            stream.on('error', err => {
                err = `error streaming object: ${err}`
                // console.log(err)
                reject(err)
            })
            stream.on('data', chunk => {
                data += chunk
                // console.log(`streaming data: ${chunk}`)
            })
            stream.on('end', () => {
                // console.log(`end streaming data: ${data}`)
                fulfill(JSON.parse(data))
            })
        })
    })
}

var listPosts = function (client, bucket) {

    return new Promise((fulfill, reject) => {
        var promises = []
        var stream = client.listObjects(bucket, '', false)
            .on('data', obj => {
                promises.push(getPost(client, bucket, { id: obj.name }))
            }).on('error', err => {
                reject(`error listing posts: ${err}`)
            }).on('end', () => {
                fulfill(Promise.all(promises))
            })
    })
}
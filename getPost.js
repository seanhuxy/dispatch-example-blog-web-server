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
            getPost(client, bucket, post).then((post) => {
                console.log(`get post ${JSON.stringify(post)}`)
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

var main = function () {
    context = {
        secrets: {
            endPoint: '192.168.99.102',
            port: 31515,
            accessKey: 'AKIAIOSFODNN7EXAMPLE',
            secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            bucket: "post-bucket"
        }
    }

    params = {
        post: {
            id: "123",
        }
    }

    return new Promise((fulfill, reject) => {
        fulfill("good")
    }).then(() => {
        Promise.resolve(moduleexports(context, params)).then((obj) => {
            console.log(`return value: ` + JSON.stringify(obj))
        }).catch(err => {
            console.error(err)
        })
    }).catch((e) => {
        console.error(`exception: ${e}`)
    })
}
// main()
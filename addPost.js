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
            addPost(client, bucket, post).then((post) => {
                console.log(`added post ${JSON.stringify(post)}`)
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

var addPost = function (client, bucket, post) {

    return new Promise((fulfill, reject) => {
        client.putObject(bucket, post.id, JSON.stringify(post), (err, etag) => {
            console.log(`putObject: put post.id=${post.id}`)
            if (err) {
                return reject(`error add post: ${err}`)
            }
            fulfill(post)
        })
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

    params = {
        post: {
            id: "123",
            title: "a blog title",
            content: "a blog text",
        }
    }

    ret = moduleexports(context, params)
    console.log(ret)
}
// main()


// var bucketExists = function (client, bucket, callback) {
//     client.bucketExists(bucket, function (err) {
//         if (err) {
//             if (err.code == 'NoSuchBucket') {
//                 makeBucket(client, bucket, callback)
//             }
//             return callback(err)
//         }
//         return callback(null)
//     })
// }

// var makeBucket = function (client, bucket, callback) {
//     client.makeBucket(postBucket, '', function (err) {
//         if (err) {
//             return callback(err)
//             // return console.log('Error creating bucket.', err)
//         }
//         return callback(null)
//         // console.log('Bucket created successfully in "us-east-1".')
//     })
// }

// var postBucket = "post-bucket"
// var client = new Minio.Client({
//     endPoint: '192.168.99.102',
//     port: 31515,
//     secure: false,
//     accessKey: 'AKIAIOSFODNN7EXAMPLE',
//     secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
// });



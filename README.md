


## Prerequisite

You will need a dispatch cluster deployed and configured, please follow the quick start instruction at [dispatch](https://github.com/vmware/dispatch) repository.

You will need the url of your dispatch installation.
e.g.
```
DISPATCH_HOST=dev.dispatch.vmware.com
DISPATCH_API_HOST=api.dev.dispatch.vmware.com
```

For minikube deployment, keep a note of the port of your dispatch host and dipatch api-gateway host.

## Build the image
export docker_user=<your-docker-username>
docker build -t ${docker_user}/dipatch-nodejs6-blog-webapp:0.0.1-dev1 ./base-image
docker push ${docker_user}/dipatch-nodejs6-blog-webapp:0.0.1-dev1

## Register the image with Dispatch

```
dispatch delete base-image blog-webapp-base-image
dispatch delete image blog-webapp-image
dispatch create base-image blog-webapp-base-image ${docker_user}/dipatch-nodejs6-blog-webapp:0.0.1-dev1 --language=nodejs6
dispatch create image blog-webapp-image blog-webapp-base-image
```

## Secret

```
dispatch delete secret blog-webapp-secret
dispatch create secret blog-webapp-secret secret.json
```

## Upload the post.js as a Dispatch function

```
dispatch delete function post
dispatch create function blog-webapp-image post post.js
```

## Milestone One: Execute the uploaded function with dispatch cli

Use dispatch cli to test if your images, secrets and functions are deployed correctly and ready to be used.

```
dispatch exec post --secret blog-webapp-secret --input '{"op":"add", "post":{"id":"126", "title":"helloworld", "content":"this is a content"}}' --wait
dispatch exec post --secret blog-webapp-secret --input '{"op":"get", "post":{"id":"126"}}' --wait
dispatch exec post --secret blog-webapp-secret --input '{"op":"update", "post":{"id":"126", "title":"nihao", "content":"nihao"}}' --wait
dispatch exec post --secret blog-webapp-secret --input '{"op":"list"}' --wait
dispatch exec post --secret blog-webapp-secret --input '{"op":"delete", "post":{"id":"126"}}' --wait
```

## Create APIs

APIs are used by the blog webapp client (an angular2.0 project)

<!-- issue: need a way to get dispatch api host -->
<!-- issue: api secret injection -->


```
dispatch delete api list-post-api
dispatch delete api get-post-api
dispatch delete api update-post-api
dispatch delete api add-post-api
dispatch delete api delete-post-api

dispatch create api list-post-api post --auth public -m GET --path /post/list --cors
dispatch create api get-post-api post --auth public -m GET  --path /post/get --cors
dispatch create api add-post-api post --auth public -m POST  --path /post/add --cors
dispatch create api update-post-api post --auth public -m PATCH --path /post/update --cors
dispatch create api delete-post-api post --auth public -m DELETE --path /post/delete --cors
```


```
export DISPATCH_API_PORT=31841

curl -X OPTIONS https://api.dev.dispatch.vmware.com:${DISPATCH_API_PORT}/post/list?op=list -k
c

curl -X GET https://api.dev.dispatch.vmware.com:${DISPATCH_API_PORT}/post/list?op=list -k
curl -X GET https://api.dev.dispatch.vmware.com:${DISPATCH_API_PORT}/post/get?op=get\&post=125 -k

curl -X POST https://api.dev.dispatch.vmware.com:${DISPATCH_API_PORT}/post/add -k -d '{
    "op": "add",
    "post":{
        "id": "1234",
        "title": "foo",
        "content":"bar bar bar"
    }
}'

curl -X PATCH https://api.dev.dispatch.vmware.com:${DISPATCH_API_PORT}/post/update -k -d '{
    "op": "update",
    "post":{
        "id": "1234",
        "title": "foo",
        "content":"foo foo foo"
    }
}'

curl -X DELETE https://api.dev.dispatch.vmware.com:${DISPATCH_API_PORT}/post/delete -k -d '{
    "op": "delete",
    "post": { "id": "1234"}
}'


```



## install dispatch

dispatch install --file config.yaml

## Build the image
export docker_user=seanhu93
docker build -t ${docker_user}/dipatch-nodejs6-blog-webapp:0.0.1-dev1 ./base-image
docker push ${docker_user}/dipatch-nodejs6-blog-webapp:0.0.1-dev1

## Register the image in Dispatch
dispatch delete base-image blog-webapp-base-image
dispatch delete image blog-webapp-image
dispatch create base-image blog-webapp-base-image ${docker_user}/dipatch-nodejs6-blog-webapp:0.0.1-dev1 --language=nodejs6
dispatch create image blog-webapp-image blog-webapp-base-image

## Secret

dispatch create secret blog-webapp-secret secret.json

## create function

dispatch delete function get-post
dispatch create function blog-webapp-image get-post blog-app/blog-web-server/getPost.js

dispatch delete function add-post
dispatch create function blog-webapp-image add-post blog-app/blog-web-server/addPost.js

dispatch delete function list-posts
dispatch create function blog-webapp-image list-posts blog-app/blog-web-server/listPosts.js

dispatch delete function post
dispatch create function blog-webapp-image post post.js

## execute function

dispatch exec post --secret blog-webapp-secret --input '{"op":"get", "post":{"id":"123"}}' --wait

dispatch exec post --secret blog-webapp-secret --input '{"op":"list"}' --wait

dispatch exec post --secret blog-webapp-secret --input '{"op":"add", "post":{"id":"126", "title":"helloworld", "content":"this is a content"}}' --wait

dispatch exec post --secret blog-webapp-secret --input '{"op":"update", "post":{"id":"126", "title":"nihao", "content":"nihao"}}' --wait

dispatch exec post --secret blog-webapp-secret --input '{"op":"delete", "post":{"id":"126"}}' --wait

## create apis

<!-- issue: need a way to get dispatch api host -->
<!-- issue: api secret injection -->

``-m OPTIONS`` is a workaround for an known issue [#174](https://github.com/vmware/dispatch/issues/174)
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

# Santa Editor Proxy
Test Santa Editor with online Santa sites.

## Usage
```
node app.js [-p <port>] [-s <site>]
```
where *port* is the port number on which sata-editor-proxy will listen (default is **3001**), and *site* is the host address of the remote site to retrieve. Note that on some systems listening on port 80 requires *sudo*.

Alternatively, you can launch sata-editor-proxy with default parameters using the command:
```
npm start
```

**Note:** when retrieving the remote site, sata-editor-proxy always automatically adds the URL parameters: *?ds=true&debug=all* so you should not try to add them explicitly.

## URL Parameters
You can override the address of the remote site using the *site* URL parameter:
```
http://localhost:3001?site=testsite.wix.com
```


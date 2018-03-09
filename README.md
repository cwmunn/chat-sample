# chat-sample

## Initial plan
#### API
Provide the following functions:
- initialization (cometd, initialize-workspace, activate-channels - chat)
- ready/notReady/dndOn/Off/logout (of chat)
- publication of cometd ChannelStateChange/InteractionStateChange/MessageLogUpdated
- accept/reject/leave/complete
- sendMessage, start/stop typing notifications
###UI
X Handle auth code grant flow for login
- Display interaction status
- buttons for accept/reject/leave/complete based on capabilities (either enable/disable or not shown)
- transcript area where messages are rendered. scrollable.
- message input box button to send message
- sending start/stop typing notifications

## Later
- rendering all of the above for each of multiple chat (tabs or other container mechanism)
- visualization and manipulation of userdata
- visualization of chat participants
- transfer/invite/consult
- send url

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

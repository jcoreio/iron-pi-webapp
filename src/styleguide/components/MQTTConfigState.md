Connecting:
```js
<MQTTConfigState
  state={{
    id: 1,
    status: 'connecting'
  }}
/>
```

Connected:
```js
<MQTTConfigState
  state={{
    id: 1,
    status: 'connected',
    connectedSince: Date.now() - 3502341,
  }}
/>
```

Error:
```js
<MQTTConfigState
  state={{
    id: 1,
    status: 'error',
    error: 'Connection failed',
  }}
/>
```

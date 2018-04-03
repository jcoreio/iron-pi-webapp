### Loading
```js
<NetworkSettingsForm
  initialValues={{ipAddress: '203.201.89.40', dhcpEnabled: false}}
  data={{loading: true}}
/>
```

### With Valid Address
```js
<NetworkSettingsForm
  initialValues={{ipAddress: '203.201.89.40', dhcpEnabled: false}}
  data={{loading: false}}
/>
```

### With Invalid Address
```js
<NetworkSettingsForm
  initialValues={{ipAddress: '2034.201.89.40', dhcpEnabled: false}}
  data={{loading: false}}
/>
```

### For DHCP
```js
<NetworkSettingsForm
  initialValues={{ipAddress: '2034.201.89.40', dhcpEnabled: true}}
  data={{loading: false, state: {ipAddress: '201.32.48.59', netmask: '0.0.255.255'}}}
/>
```


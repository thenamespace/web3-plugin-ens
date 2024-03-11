# Nemaspace ENS Web3 Plugin

The plugin that extends the ENS functionality, by providing the latest ENS features such as domain registration and setting text records.

# Setting up the plugin

Register your plugin. There are two types of connections for which the plugin can be registered: private connection - connecting with your private key, public connection - connecting with a wallet such as MetaMask.

### Public connection

```ts
const web3 = new Web3(window.ethereum);
```

### Private connection

```ts
const web3 = new Web3('_your_rpc_connection_url_');
```

Next you will need to initialize the plugin. The plugin supports Ethereum Mainnet: `const chain = Chain.Sepolia` and Sepolia: `const chain = Chain.Mainnet`.

```ts
web3.registerPlugin(new EnsPlugin(chain));
```

For **private connections** you will also need to link your account to the plugin.

```ts
const account = web3.eth.accounts.privateKeyToAccount('_your_private_key');
web3.eth.accounts.wallet.add(account);
```

# Domain registration

In order to register an ENS domain, you will need to create a `RegistrationRequest`:

```ts
interface RegistrationRequest {
  label: string; // label of the ENS domain, eg. web3js.eth, where web3js is the label
  owner: string; // address of the wallet that will own the domain
  durationInSeconds: number; // how long the domain will registered for
  secret: string; // random secret string
  resolver: string; // address of the resolver for the domain getting registered
  setAsPrimary: boolean; // is the domain primary for the address registering the domain (creates reverese record)
  fuses: number; // fuses that will be burned for the domain name
}
```

To learn more about the registration details please refer to: https://docs.ens.domains/registry/eth#controllers

Once you have `RegistrationRequest`, proceed with the registration:

1. Submit a commitment hash based on the instance of `registrationRequest`, which is used to prevent front running of the registration process:

```ts
await web3.ens.commit(registrationRequest);
```

2. To prevent front running and ensure that the registration makes it to another block, ENS requires at least one minute delay before proceeding to the next step.
3. Finally, after the one minute delay submit the registration request:

```ts
await web3.ens.register(registrationRequest);
```

# Setting and retrieving text records

To **set records** call `setTextRecords` with these parameters:

- `name` ENS domain for which the records are set (for example `yourname.eth`)
- `recordsToUpdate` array of `TextRecord`, where `TextRecord` is defined as:

```ts
interface TextRecord {
  key: string;
  value: string;
}
```

- `recordsToRemove` array of record `key`s requiring removal

```ts
await web3.ens.setTextRecords(name, recordsToUpdate, recordsToRemove);
```

To **get records** call `getRecords` with these parameters:

- `name` ENS domain for which the records are retrieved (for example `yourname.eth`)
- `recordKeys` array of record `key`s for which the retrieval is required

```ts
await web3.ens.getTextRecords(name, recordKeys);
```

# Address and name resolution

### Address resolution

To set the address to which the name will resolve call `setAddress` with these parameters:

- `name` for which the address is set (for example `yourname.eth`)
- `address` address of the wallet

```ts
await web3.ens.setAddress(name, address);
```

To resolve the address call:

```ts
await web3.ens.getAddress(name);
```

### Reverse name resolution

For reverse name resolution call, which will set the caller's address to which `name` gets resolved:

```ts
await web3.ens.setName(name);
```

You can also call `setNameForAddr` and provide these parameters:

- `address` address for which to set the record
- `owner` address that owns the revers record
- `resolver` address of the resolver which will resolve records
- `name` name for which the address will resolve (for example `yourname.eth)

```ts
await web3.ens.setNameForAddr(address, owner, resolver, name);
```

To resolve the name for the stored adddress call:

```ts
const node = await web3.ens.node(address);
const name = await web3.ens.getName(node);
```

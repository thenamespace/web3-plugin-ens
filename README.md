# Namespace ENS Web3 Plugin

[Web3](https://web3js.org/) plugin that extends ENS functionality, and provides the following features:

- ENS name registration
- text record management and resolution
- address and name resolution

# Installation

```
yarn add web3 @namespace-ens/web3-plugin-ens
```

# Setting up the plugin

Register your plugin. There are two types of connections for which the plugin can be registered:

- _public connection_ - connecting with a wallet such as MetaMask.
- _private connection_ - connecting with your private key

### Public connection

```ts
const web3 = new Web3(window.ethereum);
```

### Private connection

```ts
const web3 = new Web3('_your_rpc_connection_url_');
```

Next you will need to register the plugin. The plugin supports Ethereum Mainnet: `const chain = Chain.Mainnet` and Sepolia: `const chain = Chain.Sepolia`.

```ts
web3.registerPlugin(new EnsPlugin(chain));
```

For **private connections** you will also need to link your account to the plugin.

```ts
web3.eth.accounts.wallet.add('_your_private_key_');
```

# Domain registration

In order to register an ENS domain, you will need to create a `RegistrationRequest`:

```ts
interface RegistrationRequest {
  label: string; // label of the ENS domain (eg. web3js.eth, where web3js is the label)
  owner: string; // address of the wallet that will own the domain
  durationInSeconds: number; // how long the domain will registered for (set 31536000 for one year)
  secret: string; // random secret string
  resolver: string; // address of the domain name resolver (use 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63 for the official ENS PublicResolver)
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

- `name`: ENS domain for which the records are set (for example `yourname.eth`)
- `recordsToUpdate`: array of `TextRecord`s, where `TextRecord` is defined as:

```ts
interface TextRecord {
  key: string;
  value: string;
}
```

- `recordsToRemove`: array of record `key`s for which removal is required

```ts
await web3.ens.setTextRecords(name, recordsToUpdate, recordsToRemove);
```

To **get records** call `getRecords` with these parameters:

- `name`: ENS domain for which the records are retrieved (for example `yourname.eth`)
- `recordKeys`: array of record `key`s for which the retrieval is required

```ts
await web3.ens.getTextRecords(name, recordKeys);
```

# Address and name resolution

### Address resolution

To set the address to which the name will resolve, call `setAddress` with these parameters:

- `name`: for which the address is set (for example `yourname.eth`)
- `address`: address of the wallet

```ts
await web3.ens.setAddress(name, address);
```

To resolve the address call:

```ts
await web3.ens.getAddress(name);
```

### Reverse name resolution

To set the name for your address call `setName`:

```ts
await web3.ens.setName(name);
```

You can also call `setNameForAddr` and provide these parameters:

- `address`: address for which to set the record
- `owner`: address that owns the reverse record
- `resolver`: address of the resolver (use 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63 for the official ENS PublicResolver)
- `name`: name for which the address will resolve (for example `yourname.eth`)

**The wallet calling `setNameForAddr` will need to be given the approval by the wallet at the above `address`** - this can be done by calling [setApprovalForAll](https://docs.ens.domains/registry/ens#other-functions)

```ts
await web3.ens.setNameForAddr(address, owner, resolver, name);
```

To resolve the name for the stored adddress call:

```ts
const node = await web3.ens.node(address);
const name = await web3.ens.getName(node);
```

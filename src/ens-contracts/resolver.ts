import { namehash } from 'viem';
import Web3, { AbiFunctionFragment, Address, Contract } from 'web3';
import { Chain } from 'web3-eth-accounts';
import abi from '../abi/public-resolver.json';

export interface TextRecord {
  key: string;
  value: string;
}

export class Resolver {
  public static readonly RESOLVER_ADDRESS_MAINNET: Address = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';
  public static readonly RESOLVER_ADDRESS_SEPOLIA: Address = '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD';
  private static _contract: Contract<typeof abi>;
  private static _resolver: Resolver;

  private constructor() {}

  static create(chain: Chain) {
    if (Resolver._resolver) return;

    if (chain != Chain.Mainnet && chain != Chain.Sepolia) throw new Error('Invalid chain');

    const address =
      chain == Chain.Mainnet ? Resolver.RESOLVER_ADDRESS_MAINNET : Resolver.RESOLVER_ADDRESS_SEPOLIA;

    Resolver._contract = new Contract(abi, address);
    Resolver._resolver = new Resolver();
  }

  static get instance() {
    return Resolver._resolver;
  }

  get contract() {
    return Resolver._contract;
  }

  async setTextRecords(name: string, recordsToUpdate: TextRecord[], recordsToRemove: string[]) {
    name = name.toLowerCase();
    const nameNode = namehash(name);

    const web3 = new Web3(this.contract.provider);
    const acct = await web3.eth.getAccounts();

    // set up the encode function
    const setTextFn = abi.find((abi) => abi.name === 'setText') as AbiFunctionFragment;
    const encode = (key: string, value: string) =>
      web3.eth.abi.encodeFunctionCall(setTextFn, [nameNode, key, value]);

    // encode records to update
    const updated = recordsToUpdate?.map((record) => encode(record.key, record.value));

    // encode records to remove
    const deleted = recordsToRemove?.map((record) => encode(record, ''));

    // call multicall to store encoded records
    return await this.contract.methods.multicall([...updated, ...deleted]).send({
      from: acct[0],
    });
  }

  async getTextRecords(name: string, recordKeys: string[]): Promise<TextRecord[]> {
    name = name.toLowerCase();
    const nameNode = namehash(name);

    const web3 = new Web3(this.contract.provider);

    // set up the encode function
    const textFn = abi.find((abi) => abi.name === 'text') as AbiFunctionFragment;
    const encode = (key: string) => web3.eth.abi.encodeFunctionCall(textFn, [nameNode, key]);

    // encode keys for which to retrieve records
    const keys = recordKeys?.map((key) => encode(key));

    // get the records by calling multicall
    const records = (await this.contract.methods.multicall(keys).call()) as [];

    // set up the decode function
    const decode = (record: string) => web3.eth.abi.decodeParameters(['string'], record);

    // decode retrieved records
    return records
      ?.map((record) => decode(record))
      .map((record, index) => {
        return { key: recordKeys[index], value: record[0] };
      }) as TextRecord[];
  }

  async setAddress(name: string, address: string) {
    const web3 = new Web3(this.contract.provider);
    const acct = await web3.eth.getAccounts();
    return await this.contract.methods.setAddr(namehash(name.toLowerCase()), address).send({ from: acct[0] });
  }

  async getAddress(name: string): Promise<string> {
    return await this.contract.methods.addr(namehash(name.toLowerCase())).call();
  }

  async getName(node: string): Promise<string> {
    return await this.contract.methods.name(node).call();
  }
}

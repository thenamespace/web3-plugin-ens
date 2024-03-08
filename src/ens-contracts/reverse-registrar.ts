import Web3, { Address, Contract } from 'web3';
import { Chain } from 'web3-eth-accounts';
import abi from '../abi/reverse-registrar.json';

export class ReverseRegistrar {
  public static REVERSE_REGISTRAR_ADDRESS_MAINNET: Address = '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb';
  public static REVERSE_REGISTRAR_ADDRESS_SEPOLIA: Address = '0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6';
  private static _contract: Contract<typeof abi>;
  private static _resolver: ReverseRegistrar;

  private constructor() {}

  static create(chain: Chain) {
    if (ReverseRegistrar._resolver) return;

    if (chain != Chain.Mainnet && chain != Chain.Sepolia) throw new Error('Invalid chain');

    const address =
      chain == Chain.Mainnet
        ? ReverseRegistrar.REVERSE_REGISTRAR_ADDRESS_MAINNET
        : ReverseRegistrar.REVERSE_REGISTRAR_ADDRESS_SEPOLIA;

    ReverseRegistrar._contract = new Contract(abi, address);
    ReverseRegistrar._resolver = new ReverseRegistrar();
  }

  static get instance() {
    return ReverseRegistrar._resolver;
  }

  get contract() {
    return ReverseRegistrar._contract;
  }

  async node(address: Address): Promise<string> {
    return await this.contract.methods.node(address).call();
  }

  async setName(name: string) {
    const web3 = new Web3(this.contract.provider);
    const acct = await web3.eth.getAccounts();
    return await this.contract.methods.setName(name).send({ from: acct[0] });
  }

  async setNameForAddr(address: Address, owner: Address, resolver: Address, name: string) {
    const web3 = new Web3(this.contract.provider);
    const acct = await web3.eth.getAccounts();
    return await this.contract.methods.setNameForAddr(address, owner, resolver, name).send({ from: acct[0] });
  }
}

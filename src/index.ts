import { Address, HexString, TransactionReceipt, Web3Context, Web3EthPluginBase } from 'web3';
import { Chain } from 'web3-eth-accounts';
import { EnsController, RegistrationRequest } from './ens-contracts/controller';
import { Resolver, TextRecord } from './ens-contracts/resolver';
import { ReverseRegistrar } from './ens-contracts/reverse-registrar';

export class EnsPlugin extends Web3EthPluginBase {
  public pluginNamespace = 'ens';

  constructor(chain: Chain) {
    super();
    EnsController.create(chain);
    Resolver.create(chain);
    ReverseRegistrar.create(chain);
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    EnsController.instance.contract.link(parentContext);
    Resolver.instance.contract.link(parentContext);
    ReverseRegistrar.instance.contract.link(parentContext);
  }

  public async commit(request: RegistrationRequest): Promise<TransactionReceipt> {
    return await EnsController.instance.commit(request);
  }

  public async registerEnsDomain(request: RegistrationRequest): Promise<TransactionReceipt> {
    return await EnsController.instance.register(request);
  }

  public async setTextRecords(
    name: string,
    recordsToUpdate: TextRecord[],
    recordsToRemove: string[],
  ): Promise<TransactionReceipt> {
    return await Resolver.instance.setTextRecords(name, recordsToUpdate, recordsToRemove);
  }

  public async getTextRecords(name: string, recordKeys: string[]): Promise<TextRecord[]> {
    return await Resolver.instance.getTextRecords(name, recordKeys);
  }

  public async setAddress(name: string, address: Address): Promise<TransactionReceipt> {
    return await Resolver.instance.setAddress(name, address);
  }

  public async getAddress(name: string): Promise<Address> {
    return await Resolver.instance.getAddress(name);
  }

  public async getName(node: HexString): Promise<string> {
    return await Resolver.instance.getName(node);
  }

  public async setName(name: string): Promise<TransactionReceipt> {
    return await ReverseRegistrar.instance.setName(name);
  }

  public async node(address: Address): Promise<string> {
    return await ReverseRegistrar.instance.node(address);
  }
}

declare module 'web3' {
  interface Web3Context {
    ens: EnsPlugin;
  }
}

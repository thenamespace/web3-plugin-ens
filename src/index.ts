import { Web3Context, Web3EthPluginBase } from 'web3';
import { Chain } from 'web3-eth-accounts';
import { EnsController, RegistrationRequest } from './ens-contracts/controller';
import { Resolver, TextRecord } from './ens-contracts/resolver';

export class EnsPlugin extends Web3EthPluginBase {
  public pluginNamespace = 'ens';

  constructor(chain: Chain) {
    super();
    EnsController.create(chain);
    Resolver.create(chain);
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    EnsController.instance.contract.link(parentContext);
    Resolver.instance.contract.link(parentContext);
  }

  public async makeCommitment(request: RegistrationRequest): Promise<string> {
    return await EnsController.instance.makeCommitment(request);
  }

  public async registerEnsDomain(request: RegistrationRequest) {
    return await EnsController.instance.register(request);
  }

  public async setTextRecords(name: string, recordsToUpdate: TextRecord[], recordsToRemove: string[]) {
    return await Resolver.instance.setTextRecords(name, recordsToUpdate, recordsToRemove);
  }

  public async getTextRecords(name: string, recordKeys: string[]): Promise<TextRecord[]> {
    return await Resolver.instance.getTextRecords(name, recordKeys);
  }

  public async setAddress(name: string, address: string) {
    return await Resolver.instance.setAddress(name, address);
  }

  public async getAddress(name: string): Promise<string> {
    return await Resolver.instance.getAddress(name);
  }

  public async getName(node: string): Promise<string> {
    return await Resolver.instance.getName(node);
  }
}

declare module 'web3' {
  interface Web3Context {
    ens: EnsPlugin;
  }
}

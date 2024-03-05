import { Web3Context, Web3EthPluginBase } from 'web3';
import { Chain } from 'web3-eth-accounts';
import { EnsController, RegistrationRequest } from './ens-contracts/controller';
import { Resolver, TextRecord } from './ens-contracts/resolver';

// declare var window: any;

export class EnsPlugin extends Web3EthPluginBase {
  public pluginNamespace = 'ens';

  constructor(chain: Chain) {
    super();
    EnsController.get(chain);
    Resolver.get(chain);
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    EnsController.get().contract.link(parentContext);
    Resolver.get().contract.link(parentContext);
  }

  public async makeCommitment(request: RegistrationRequest): Promise<string> {
    return await EnsController.get().makeCommitment(request);
  }

  public async registerEnsDomain(request: RegistrationRequest) {
    return await EnsController.get().register(request);
  }

  public async setTextRecords(name: string, recordsToUpdate: TextRecord[], recordsToRemove: string[]) {
    return await Resolver.get().setTextRecords(name, recordsToUpdate, recordsToRemove);
  }

  public async getTextRecords(name: string, recordKeys: string[]): Promise<TextRecord[]> {
    return await Resolver.get().getTextRecords(name, recordKeys);
  }

  public async setAddress(name: string, address: string) {
    return await Resolver.get().setAddress(name, address);
  }

  public async getAddress(name: string): Promise<string> {
    return await Resolver.get().getAddress(name);
  }

  public async getName(node: string): Promise<string> {
    return await Resolver.get().getName(node);
  }
}

declare module 'web3' {
  interface Web3Context {
    ens: EnsPlugin;
  }
}

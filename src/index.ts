import { Web3Context, Web3EthPluginBase } from 'web3';
import { Chain } from 'web3-eth-accounts';
import { EnsController, RegistrationRequest } from './ens-contracts/controller';

// declare var window: any;

export class EnsPlugin extends Web3EthPluginBase {
  public pluginNamespace = 'ens';

  constructor(chain: Chain) {
    super();
    EnsController.get(chain);
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    EnsController.get().contract.link(parentContext);
  }

  public async makeCommitment(request: RegistrationRequest) {
    return await EnsController.get().makeCommitment(request);
  }

  public async registerEnsDomain(request: RegistrationRequest) {
    await EnsController.get().register(request);
  }
}

declare module 'web3' {
  interface Web3Context {
    ens: EnsPlugin;
  }
}

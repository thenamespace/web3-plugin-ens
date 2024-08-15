import { namehash, toHex } from 'viem';
import { Address, Contract, TransactionReceipt, Web3 } from 'web3';
import { Chain } from 'web3-eth-accounts';
import abi from '../abi/eth-controller.json';

export interface RegistrationRequest {
  label: string;
  owner: string;
  durationInSeconds: number;
  secret: string;
  resolver: string;
  setAsPrimary: boolean;
  fuses: number;
}

interface IRentPriceResponse {
  base: bigint;
  premium: bigint;
}

export class EnsController {
  public static readonly CONTROLLER_ADDRESS_MAINNET: Address = '0x253553366da8546fc250f225fe3d25d0c782303b';
  public static readonly CONTROLLER_ADDRESS_SEPOLIA: Address = '0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72';
  private static _contract: Contract<typeof abi>;
  private static _controller: EnsController;

  private constructor() {}

  static create(chain: Chain) {
    if (chain != Chain.Mainnet && chain != Chain.Sepolia) throw new Error('Invalid chain');

    const address =
      chain == Chain.Mainnet
        ? EnsController.CONTROLLER_ADDRESS_MAINNET
        : EnsController.CONTROLLER_ADDRESS_SEPOLIA;

    EnsController._contract = new Contract(abi, address);
    EnsController._controller = new EnsController();
  }

  static get instance() {
    return EnsController._controller;
  }

  get contract() {
    return EnsController._contract;
  }

  async commit(req: RegistrationRequest): Promise<TransactionReceipt> {
    const label = req.label.toLocaleLowerCase();
    const regData = await this.encodeSetAddr(`${label}.eth`, req.owner);
    const encodedSecret = toHex(req.secret, { size: 32 });
    const commitment = await this.contract.methods
      .makeCommitment(
        label,
        req.owner,
        req.durationInSeconds,
        encodedSecret,
        req.resolver,
        [regData],
        req.setAsPrimary,
        req.fuses,
      )
      .call();

    const web3 = new Web3(this.contract.provider);
    const acct = this.contract.wallet?.[0]?.address;
    const accts = await web3.eth.getAccounts();
    const from = acct ?? accts[0];

    return await this.contract.methods.commit(commitment).send({ from });
  }

  async register(req: RegistrationRequest): Promise<TransactionReceipt> {
    const label = req.label.toLocaleLowerCase();
    const regData = await this.encodeSetAddr(`${label}.eth`, req.owner);
    const encodedSecret = toHex(req.secret, { size: 32 });
    const totalPrice = await this.estimatePrice(req.label, req.durationInSeconds);
    const value = BigInt(totalPrice).toString();

    const web3 = new Web3(this.contract.provider);
    const acct = this.contract.wallet?.[0]?.address;
    const accts = await web3.eth.getAccounts();
    const from = acct ?? accts[0];

    return await this.contract.methods
      .register(
        label,
        req.owner,
        req.durationInSeconds,
        encodedSecret,
        req.resolver,
        [regData],
        req.setAsPrimary,
        req.fuses,
      )
      .send({
        from,
        value,
      });
  }

  async estimatePrice(label: string, durationInSeconds: number): Promise<bigint> {
    const estimate: IRentPriceResponse = await this.contract.methods
      .rentPrice(label, durationInSeconds)
      .call();
    return estimate.base + estimate.premium;
  }

  private async encodeSetAddr(name: string, registrant: string) {
    const web3 = new Web3(this.contract.provider);
    return web3.eth.abi.encodeFunctionCall(
      {
        name: 'setAddr',
        type: 'function',
        inputs: [
          {
            type: 'bytes32',
            name: 'node',
          },
          {
            type: 'address',
            name: 'a',
          },
        ],
      },
      [namehash(name), registrant],
    );
  }
}

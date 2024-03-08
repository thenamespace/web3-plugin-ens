import { namehash } from 'viem';
import { Address, Contract, Web3 } from 'web3';
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
    if (EnsController._controller) return;

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

  async makeCommitment(req: RegistrationRequest): Promise<any> {
    const encodedSecret = this.toBytes32HexString(req.secret);
    const regData = await this.encodeSetAddr(`${req.label}.eth`, req.owner);
    const commitment = await this.contract.methods
      .makeCommitment(
        req.label.toLocaleLowerCase(),
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
    const acct = await web3.eth.getAccounts();

    return await this.contract.methods.commit(commitment).send({ from: acct[0] });
  }

  async register(req: RegistrationRequest) {
    const encodedSecret = this.toBytes32HexString(req.secret);
    const regData = await this.encodeSetAddr(`${req.label}.eth`, req.owner);
    const totalPrice = await this.estimatePrice(req.label, req.durationInSeconds);
    const value = BigInt(totalPrice).toString();

    const web3 = new Web3(this.contract.provider);
    const acct = await web3.eth.getAccounts();

    return await this.contract.methods
      .register(
        req.label.toLocaleLowerCase(),
        req.owner,
        req.durationInSeconds,
        encodedSecret,
        req.resolver,
        [regData],
        req.setAsPrimary,
        req.fuses,
      )
      .send({
        from: acct[0],
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

  private toBytes32HexString(value: string) {
    const utf8String = encodeURIComponent(value);
    const stringBytes = [];
    for (let i = 0; i < utf8String.length; i++) {
      stringBytes.push(utf8String.charCodeAt(i));
    }

    // ensure the byte array is 32 bytes long
    const padding = new Array(32 - stringBytes.length).fill(0);
    const paddedBytes = [...stringBytes, ...padding];

    // convert the byte array to a bytes32 type
    const bytes32Value = '0x' + Buffer.from(paddedBytes).toString('hex');

    return bytes32Value;
  }
}

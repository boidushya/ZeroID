import { Field, PublicKey, SmartContract, State, method, state } from 'o1js';

export class MID extends SmartContract {
  @state(PublicKey) mainPublicKey = State<PublicKey>();
  @state(Field) commitment = State<Field>();

  @method initState(mainPublicKey: PublicKey, initialCommitment: Field) {
    super.init();
    this.mainPublicKey.set(mainPublicKey);
    this.commitment.set(initialCommitment);
  }
}

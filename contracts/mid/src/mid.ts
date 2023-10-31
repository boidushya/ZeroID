import {
  Field,
  Poseidon,
  PublicKey,
  SmartContract,
  State,
  Struct,
  method,
  state,
} from 'o1js';

export class Account extends Struct({
  aadharNumber: Number,
  salt: String,
}) {
  // Hash method to has the contents of the account while adding it to the merkle tree
  hash(): Field {
    return Poseidon.hash(Account.toFields(this));
  }

  // To return a new account
  addValidatedAccount(aadharNumber: number, salt: string) {
    return new Account({
      aadharNumber: aadharNumber,
      salt: salt,
    });
  }
}

export class MID extends SmartContract {
  @state(PublicKey) mainPublicKey = State<PublicKey>();
  @state(Field) commitment = State<Field>();

  @method initState(mainPublicKey: PublicKey, initialCommitment: Field) {
    super.init();
    this.mainPublicKey.set(mainPublicKey);
    this.commitment.set(initialCommitment);
  }
}

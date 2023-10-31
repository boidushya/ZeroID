import {
  Field,
  MerkleWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
  SmartContract,
  State,
  Struct,
  method,
  state,
} from 'o1js';

class MerkleWitnessId extends MerkleWitness(8) {}
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

  @method updateRoot(mainPrivateKey: PrivateKey, updatedCommitment: Field) {
    // Here we are going to add the validated account into the merkle tree
    // ToDo: Check and add the reducers to avoid the failure during multiple verification
    const commitedPublicKey = this.mainPublicKey.get();
    this.mainPublicKey.assertEquals(commitedPublicKey);

    commitedPublicKey.assertEquals(mainPrivateKey.toPublicKey());

    // Now we will update the existing commitment with the new commitment
    this.commitment.set(updatedCommitment);
  }

  @method verifiedOrNot(
    mainPublicKey: PublicKey,
    account: Field,
    path: MerkleWitnessId
  ): boolean {
    // Now let's fetch the on-chain commitment
    let commitment = this.commitment.get();
    this.commitment.assertEquals(commitment);

    // Let's check if the account is present in the merkle tree
    path.calculateRoot(account).assertEquals(commitment, 'Account not Found!'!);

    return true;
  }
}

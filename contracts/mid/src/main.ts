import { Account, MID } from './mid.js';
import {
  AccountUpdate,
  Field,
  MerkleTree,
  MerkleWitness,
  Mina,
  PrivateKey,
  Signature,
  UInt32,
  Poseidon,
} from 'o1js';

const doProofs = true;

const Local = Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);
const initialBalance = 10_000_000_000;
let feePayerKey = Local.testAccounts[0].privateKey;
let feePayer = Local.testAccounts[0].publicKey;

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

class MyMerkleWitness extends MerkleWitness(8) {}
let leafNode = 0n;
const Tree = new MerkleTree(8);

let a1Adnum = 123456789012;
let a1Salt = 'bro';

let a2Adnum = 987654321012;
let a2Salt = 'hello';

function createNewRoot(aadharNumber: number, salt: string) {
  let account = new Account({
    aadharNumber: aadharNumber,
    salt: salt,
  });
  let qrString: Field = account.hash();
  Tree.setLeaf(leafNode, qrString);
  leafNode++;
  return [Tree.getRoot(), qrString];
}

// let initialCommitment: Field = Tree.getRoot();
let [initialCommitment, qrString] = createNewRoot(a1Adnum, a1Salt);

let minaID = new MID(zkappAddress);
console.log('Deploying Contract .....');

if (doProofs) {
  await MID.compile();
}

let tx = await Mina.transaction(feePayer, () => {
  AccountUpdate.fundNewAccount(feePayer).send({
    to: zkappAddress,
    amount: initialBalance,
  });
  minaID.deploy();
  minaID.initState(feePayer, initialCommitment);
});
await tx.prove();
await tx.sign([feePayerKey, zkappKey]).send();
console.log('Contract Deployed....');

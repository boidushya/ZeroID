// Importing all required things for zkProgram
// Remeber to update from Experimental to ZKProgram
import { Field, SelfProof, Experimental, verify } from 'o1js';

/* 
    This is the smalled recursive program but that's not it.
    You might what will thise code solve, well this code is the thing that will give freedom to user..
     - Freedom to be foget there long ID numbers.
     - Freedom from worrying over stolen or lost personal ID.
     - Freedom to verify themselves with just a small QR.
    We are not here to just build something and take grant for grant.
    We want to build something that will solve the real life issue.
    Below code which you are seeing is just a small part.
    The major security plan is something more small than this and you will be amazed by what we have planned to acheieve.
    See you during Pitch.
*/

export const ZID = Experimental.ZkProgram({
  publicInput: Field,
  methods: {
    generatingInitialProof: {
      privateInputs: [],
      method(mk: Field) {
        // mk.assertEquals(Field(process.env.NEXT_PUBLIC_MASTER_KEY!.toString()));
        mk.assertEquals(Field(0));
      },
    },

    // To generate zkProof for verified users only
    verifiedUserProof: {
      privateInputs: [SelfProof, Field, Field],
      method(
        fsk: Field,
        mp: SelfProof<Field, undefined>,
        rfg: Field,
        rfu: Field
      ) {
        mp.verify();
        // fsk.assertEquals(Field(process.env.NEXT_PUBLIC_MSK!.toString()));
        fsk.assertEquals(Field(123));
        rfg.assertEquals(rfu);
      },
    },
  },
});

//----------------------------------------------------------------------------------------------------------------------------------------------//
/*Please ignore this as this is being moved to serverside */
/*
async function main() {
  console.log('o1js loaded');
  console.log('compiling...');
  const { verificationKey } = await Add.compile();
  // console.log(verificationKey);

  console.log(
    'making proof 0 for admin that can be created once and will be stored in ENV'
  );
  const proof0 = await Add.generatingInitialProof(Field(0));
  console.log(proof0.toJSON());

  console.log(`Let's see if this works...`);
  const fsk = 123;
  const rfg = 134;
  const rfu = 134;
  const proof1 = await Add.verifiedUserProof(
    Field(fsk),
    proof0,
    Field(rfg),
    Field(rfu)
  );
  console.log(proof1.toJSON().proof);

  const proof2 = await Add.verifiedUserProof(
    Field(fsk),
    proof0,
    Field(rfg),
    Field(rfu)
  );

  console.log(proof2.toJSON().proof);
  const ok = await verify(proof1.toJSON(), verificationKey);
  console.log('ok', ok);

  console.log('Shutting down');
}
main()
*/
//----------------------------------------------------------------------------------------------------------------------------------------------//

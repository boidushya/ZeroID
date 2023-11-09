import { ZID } from './zid.js';
import { Field } from 'o1js';
import express from 'express';

const app = express();
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

/* 
Need to clean up here.
This part will run everytime seerver boots up because it's required for proof generation.
*/
console.log(`Let's get you verifeid`);
const { verificationKey } = await ZID.compile();
console.log(verificationKey);

/* This part is to generated the proof 0 which will be used to verify all the proofs that are generated!! */
console.log(
  'making proof 0 for admin that can be created once and will be stored in ENV'
);
const proof0 = await ZID.generatingInitialProof(Field(0));
console.log(proof0.toJSON());
app.get('/', async (req, res) => {
  res.send('Home');
});

/* TESTING API 

app.get('/ip', async (req, res) => {
  res.send(`THsi might take some time Bro!! Hodl back`);
});
*/

/*
 Below are the api to request proofs but we will create only one api this is just for Demo purpose.
  Hope you will enjoy it!!
*/
app.get('/proof1', async (req, res) => {
  res.send('Proof 1 api hit check console log!!');
  console.log(`Let's see if this works...`);
  const fsk = 123; // Couple of inputs will come from frontend and couple will be from backend env variables
  const rfg = 134; //Ohh!!! DW we will make it most secure thing. Trust me we are gonna make it big
  const rfu = 134;
  const proof1 = await ZID.verifiedUserProof(
    Field(fsk),
    proof0,
    Field(rfg),
    Field(rfu)
  );
  console.log(proof1.toJSON().proof);
});

app.get('/proof2', async (req, res) => {
  res.send('Proof 2 api hit check console log!!');
  console.log(`Hmmm... Let me generate a proof for you!`);
  const fsk = 123;
  const rfg = 145;
  const rfu = 145;
  const proof2 = await ZID.verifiedUserProof(
    Field(fsk),
    proof0,
    Field(rfg),
    Field(rfu)
  );
  console.log(proof2.toJSON().proof);
});

/* 
This Api to get users verify. 
We will update it soon.  
Right we are just too tierd, busy and ill to work on anything but will update it soon!!
*/

app.get('/verify', async (req, res) => {
  res.send(
    'Still in progress but you will be able to see whthere you are verified or not here!!'
  );
});

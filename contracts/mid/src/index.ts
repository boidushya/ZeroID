import dotenv from 'dotenv';
import { ZID } from './zid.js';
import { Field, verify } from 'o1js';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';

dotenv.config();

const URL =
  process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL as string)
    : 'http://localhost:3000';

console.log(URL);

const app = express();
app.use(express.json());
app.use(cors());
app.use(function (err: any, req: any, res: any, next: any) {
  res.status(500).send(err.message);
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: URL,
  },
});

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('generate_proof', async (req) => {
    console.log(`Let's see if this works...`);
    // TODO: Update security
    const fsk = 123; // From env // Couple of inputs will come from frontend and couple will be from backend env variables
    const rfg = req.aadhar; // Resp from gov //Ohh!!! DW we will make it most secure thing. Trust me we are gonna make it big
    const rfu = req.aadhar; // Resp from user

    const proof1 = await ZID.verifiedUserProof(
      Field(fsk),
      proof0,
      Field(rfg),
      Field(rfu)
    );
    console.log(proof1.toJSON().proof);
    const data = await insertProof(proof1.toJSON());
    console.log(data);
    socket.emit('proof_generated', {
      message: 'Proof generated',
      proof: data,
    });
  });
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server is running on port 8000');
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
console.log(proof0.toJSON().proof);

app.get('/', async (req, res) => {
  res.send('Home');
});

/*
 Below are the api to request proofs but we will create only one api this is just for Demo purpose.
  Hope you will enjoy it!!
*/
app.post('/generateproof', async (req, res) => {
  try {
    console.log(`Let's see if this works...`);
    // TODO: Update security
    const fsk = 123; // From env // Couple of inputs will come from frontend and couple will be from backend env variables
    const rfg = req.body.aadhar; // Resp from gov //Ohh!!! DW we will make it most secure thing. Trust me we are gonna make it big
    const rfu = req.body.aadhar; // Resp from user

    const proof1 = await ZID.verifiedUserProof(
      Field(fsk),
      proof0,
      Field(rfg),
      Field(rfu)
    );
    console.log(proof1.toJSON().proof);
    const data = await insertProof(proof1.toJSON());
    console.log(data);
    res.json(data);
  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
});

/* 
This Api to get users verify. 
We will update it soon.  
Right we are just too tierd, busy and ill to work on anything but will update it soon!!
*/

app.get('/verify/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE as string
    );
    let { data, error } = await supabase.from('zk').select('*').eq('uuid', id);
    console.log(data);
    if (error || !data || data.length === 0) {
      console.log(error);
      res.status(404).json({
        message: 'ID not found! Please Verify and generate ID',
      });
    } else {
      const ok = await verifyProof(data[0].zk);
      if (ok) {
        res.json({
          verified: 'true',
          uuid: data[0].uuid,
        });
      } else {
        res.status(400).json({ verified: 'false' });
      }
    }
  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({
      message: e.message,
    });
  }
});

async function insertProof(proof: any) {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE as string
  );

  // uuid = sha256(proof+randomkeyword)
  const row = {
    zk: proof,
  };
  const { data, error } = await supabase.from('zk').insert(row).select('uuid');
  if (error || !data) {
    console.log(error);
    return;
  } else {
    console.log('Inserted row:', data);
  }
  return data[0].uuid;
}

async function verifyProof(proof1: any) {
  console.log('Verifying zkProof !!');
  const ok = await verify(proof1, verificationKey);
  console.log('ok', ok);
  return ok;
}

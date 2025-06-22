require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9rgqnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const admin = require("firebase-admin");
const decoded = Buffer.from(process.env.FB_KEY, 'base64').toString('utf8');
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const varifyFirebaseToken =async (req,res,next)=>{
  const authHeader = req.headers?.authorization;
  if(!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(401).send({message: 'unauthorized access'})
  }

  const token = authHeader.split(' ')[1];
  
  try{
      const decoded = await admin.auth().verifyIdToken(token);
      req.decoded = decoded;
      next();
      

  }
  catch(err){
    return res.status(401).send({message:'unauthorized access'})
  }

}

const varifyTokenEmail = (req,res,next)=>{

  const email = req.params.email;

  if( email !== req.decoded.email){
      return res.status(403).message({message: 'forbidden access'});
  }
  next();

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

	const servicesCollection = client.db('RateWise').collection('services');
	const usersCollection = client.db('RateWise').collection('users');
	const reviewsCollection = client.db('RateWise').collection('reviews');


	//Get featured service data for homepage
	app.get('/services', async(req,res)=>{
		const result = await servicesCollection.find().limit(6).toArray();
		res.send(result);
	})

  //Adding new service
  app.post('/addservices',varifyFirebaseToken,async(req,res)=>{
    const newServiceData = req.body;
    const result = await servicesCollection.insertOne(newServiceData);
    res.send(result);
  })

  //Get All services with params
  	app.get('/allservices', async(req,res)=>{
      const {searchParams,category} = req.query;
      let query = {}

      if(searchParams){
        query.title = {$regex: searchParams, $options: 'i'};
      }

      if(category){
        query.category =category;
      }
		const result = await servicesCollection.find(query).toArray();
		res.send(result);
	})

  //Get Specific Service Data
  app.get('/services/:id', async(req,res)=>{
    const serviceID = req.params.id;
    const query = {_id: new ObjectId(serviceID)};
    const result = await servicesCollection.findOne(query);
    res.send(result);
  })


  //Get Reviews of specific service
  app.get('/reviews/:id', async(req,res)=>{
    const serviceID = req.params.id;
    const query = {serviceID : serviceID};
    const result = await reviewsCollection.find(query).toArray();
    res.send(result);
  })

  //Adding new Review
  app.post('/addreview',varifyFirebaseToken, async(req,res)=>{
    const newReview = req.body;
    const result = await reviewsCollection.insertOne(newReview);
    res.send(result);
  })

  //CountUp API
  app.get('/counts', async(req,res)=>{
    const services = await servicesCollection.find().toArray();
    const users = await usersCollection.find().toArray();
    const reviews = await reviewsCollection.find().toArray();

    const allData = {
      services : services.length,
      users : users.length,
      reviews : reviews.length,
    }

    res.send(allData)
  })

  //Get All reviews
  	app.get('/allreviews', async(req,res)=>{
		const result = await reviewsCollection.find().toArray();
		res.send(result);
	})






 //-----------------User APIs----------------

  //User - Adding new user to DB
  app.post('/users', async(req,res)=>{
    const newUser = req.body;
    const result = await usersCollection.insertOne(newUser);
    res.send(result);
  })

  //User - get Specific user
  app.get('/user/:email', async(req,res)=>{
    const required_emial = req.params.email;
    const query = {email : required_emial};
    const result = await usersCollection.findOne(query);
    res.send(result);
  })

  //Get Services added by the user
  app.get('/myservices/:email',varifyFirebaseToken,varifyTokenEmail, async(req,res)=>{
    const email = req.params.email;
    
    const query = {userEmail : email};
    const result = await servicesCollection.find(query).toArray();
    res.send(result);
  })

  //Check is user already exists
  app.get('/userlist/:email', async(req,res)=>{
    const required_emial = req.params.email;
    const query = {email : required_emial};
    const result = await usersCollection.findOne(query);
    res.send(result || {});
  })

  //Updating Service Details
  app.put('/update/:id',varifyFirebaseToken, async(req,res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)};
    const updatedData = req.body;
    const doc = {
      $set: updatedData
    }
    const result = await servicesCollection.updateOne(query,doc);
    res.send(result);

  })

  //Deleting Data
app.delete('/myservices/:id',varifyFirebaseToken, async(req,res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)};
  const result = await servicesCollection.deleteOne(query);
  res.send(result);
})

//Fetching my submited reviews
app.get('/myreviews/:email',varifyFirebaseToken,varifyTokenEmail, async(req,res)=>{
  const email = req.params.email;
  const query = { userID : email};
  const result = await reviewsCollection.find(query).toArray();
  res.send(result)

})

//User updating data
app.put('/myreviews/:id',varifyFirebaseToken,async(req,res)=>{
  const id = req.params.id;
  const updatedData = req.body;
  const query = {_id : new ObjectId(id)};
  const file = {
    $set:{
      rating:updatedData.rating,
      description:updatedData.description
    }
  }

  const result = await reviewsCollection.updateOne(query,file);
  res.send(result);

})

//user deleting reviews
app.delete('/myreviews/:id',varifyFirebaseToken, async(req,res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)};
  const result = await reviewsCollection.deleteOne(query);
  res.send(result)
})

 


  








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
		res.send('A11 server running')
});


app.listen(port, ()=>{
		console.log('running on port,', port);
});


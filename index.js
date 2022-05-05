const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId;
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
// Middleware
app.use(cors())
app.use(express.json())

// 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });

    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });


        }
        else {
            console.log(decoded)
            req.decoded = decoded;
        }

    })

    next();


}


const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.onld4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        // connect to database
        await client.connect();
        // make a collection
        const servicesCollection = client.db('geniousDB').collection('services');
        const orderCollection = client.db('geniousDB').collection('orders');

        // Auth
        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.SECRET_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken })



        })

        // Get all services
        app.get('/services', async (req, res) => {
            // query
            const query = {};
            // cursor
            const cursor = servicesCollection.find(query);
            const allServices = await cursor.toArray()

            // send all services
            res.send(allServices)

        })

        // Get specific services
        app.get('/services/:id', async (req, res) => {
            // get service id from client site
            const serviceId = req.params.id;
            // query
            const query = { _id: ObjectId(serviceId) };

            const singleService = await servicesCollection.findOne(query);


            // send single service
            res.send(singleService)

        })

        // Post services - Insert a new service
        app.post('/services', async (req, res) => {
            const service = req.body;


            const result = await servicesCollection.insertOne(service)

            // send all services
            res.send(result)

        })
        // Delete a service
        app.delete('/services/:id', async (req, res) => {
            const serviceId = req.params.id;
            const query = { _id: ObjectId(serviceId) }
            const result = await servicesCollection.deleteOne(query);
            res.send(result)


        })
        // Update a single service
        app.put('/services/:id', async (req, res) => {
            const serviceId = req.params.id;
            const updateServiceData = req.body;
            const filter = { _id: ObjectId(serviceId) };
            const options = { upsert: true };
            const updateDocs = {
                $set: {
                    name: updateServiceData.name,
                    price: updateServiceData.price,
                    description: updateServiceData.description,
                    img: updateServiceData.img

                }
            }
            const result = await servicesCollection.updateOne(filter, updateDocs, options)
            res.send(result)


        })

        // Order Collection API
        // POST
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)

        })
        // Get Order by Email
        app.get('/orders', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if (decodedEmail === email) {
                const query = { email };
                // console.log(email)
                const cursor = orderCollection.find(query)
                const allOrders = await cursor.toArray();
                res.send(allOrders)

            }
            else{
                res.status(403).send({ message: "Forbidden access" });

            }




        })


    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Ready..')
})
// get All service
app.get('/', (req, res) => {
    res.send('Ready..')
})



app.listen(port, () => {
    console.log("listening")
})
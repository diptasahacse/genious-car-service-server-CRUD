const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId;
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.onld4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        // connect to database
        await client.connect();
        // make a collection
        const servicesCollection = client.db('geniousDB').collection('services');


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

        // Get all services
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
        app.delete('/services/:id', async(req, res) => {
            const serviceId = req.params.id;
            const query = { _id: ObjectId(serviceId) }
            const result = await servicesCollection.deleteOne(query);
            res.send(result)


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
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0uqp7h1.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const service = client.db('rehashTech').collection('serviceCollection');

        app.get('/serviceCollection', async (req, res) => {

            const query = {}
            const cursor = service.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/serviceCollection', async (req, res) => {

            const query = {}
            const cursor = service.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
    }
    finally {

    }

}
run().catch(err => console.error(err));

app.get('/', (req, res) => {

    res.send('rehash is running')

})

app.listen(port, () => {

    console.log(`server is running on ${port} `);
})
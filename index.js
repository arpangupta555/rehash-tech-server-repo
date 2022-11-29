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
        const products = client.db('rehashTech').collection('productCollection');
        const buyProductCollection = client.db('rehashTech').collection('buyProduct');

        app.get('/serviceCollection', async (req, res) => {

            const query = {}
            const cursor = service.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })




        app.get('/buyProduct', async (req, res) => {

            const query = {}

            const product = await buyProductCollection.find(query).toArray();
            res.send(product);
        })


        app.get('/category/:id', async (req, res) => {

            const id = req.params.id;
            const query = { category_id: id }
            const productSingle = await products.find(query).toArray();
            return res.send(productSingle);
        })

        app.post('/buyProducts', async (req, res) => {

            const buy = req.body
            console.log(buy);
            const query = {
                productName: buy.productName
            }

            const alreadyBooked = await buyProductCollection.find(query).toArray()

            if (alreadyBooked.length) {
                const message = `You already booked ${buy.productName}`
                return res.send({ acknowledged: false, message })
            }


            const result = await buyProductCollection.insertOne(buy);
            res.send(result);


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
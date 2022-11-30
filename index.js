const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0uqp7h1.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    try {
        const service = client.db('rehashTech').collection('serviceCollection');
        const products = client.db('rehashTech').collection('productCollection');
        const buyProductCollection = client.db('rehashTech').collection('buyProduct');
        const userCollection = client.db('rehashTech').collection('user');

        app.get('/serviceCollection', async (req, res) => {

            const query = {}
            const cursor = service.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await products.insertOne(product);
            res.send(result);
        });




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

        app.get('/buyProducts', verifyJWT, async (req, res) => {

            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const buyProduct = await buyProductCollection.find(query).toArray();
            res.send(buyProduct);
        })


        app.post('/buyProducts', async (req, res) => {

            const buy = req.body

            const query = {
                productName: buy.productName,
                email: buy.email
            }

            const alreadyBooked = await buyProductCollection.find(query).toArray()

            if (alreadyBooked.length) {
                const message = `You already booked ${buy.productName}`
                return res.send({ acknowledged: false, message })
            }


            const result = await buyProductCollection.insertOne(buy);
            res.send(result);


        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '110h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.post('/users', async (req, res) => {

            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })


        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        });

        // -------------------------------------Admin User Buyer
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })



        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'Buyer' });

        })
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });

        })



        // -------------------------------------Admin User Buyer id

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        app.put('/users/buyer/:id', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Buyer') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'Buyer'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        app.put('/users/seller/:id', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'Seller'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
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
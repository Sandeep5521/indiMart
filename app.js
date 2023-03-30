require('dotenv').config();
const express = require('express')
const app = express()
const PORT = 3000
const path = require('path')
const hbs = require('hbs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid')
const Sib = require('sib-api-v3-sdk');
//const validator = require('validator')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
});
app.set('view engine', 'hbs');
app.set('views', './templates/views');
hbs.registerPartials(path.join(__dirname, 'templates/partials'));
const con = require('./src/db.js')
const otp = require('./src/otp.js')
const Data = require('./models/data.js')
const bcrypt = require('bcryptjs');
const auth = require('./middleware/auth.js');
const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BLUE_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi()

app.get('/', auth, async (req, res) => {
    const id = req.id
    const tmp = await Data.findOne({ _id: id });
    let user = tmp.name.split(" ", 1);
    user = String(user).charAt(0).toUpperCase() + String(user).slice(1);
    res.render("home.hbs", {
        iname: 'Hi, ' + user
    })
})

app.get('/shop', auth, async (req, res) => {
    //console.log(req.query.cat);
    const id = req.id
    const tmp = await Data.findOne({ _id: id });
    let user = tmp.name.split(" ", 1);
    user = String(user).charAt(0).toUpperCase() + String(user).slice(1);
    if (req.query.cat) res.render("category.hbs", {
        shop: req.query.cat,
        iname: 'Hi, ' + user
    })
    else res.sendFile(__dirname + '/src/error.html')
})

app.get('/pay', (req, res) => {
    res.sendFile(__dirname + '/src/checkout.html')
})

// app.get('/wishlist', async (req, res) => {
//     const cookie = req.cookies.jwt;
//     if (!cookie) res.redirect('/login')
//     else {
//         const id = jwt.verify(cookie, process.env.SECRET_KEY);
//         const tmp = await Data.findOne({ _id: id });
//         const user = tmp.name.split(" ", 1);
//         res.render("home.hbs", {
//             iname: user
//         })
//     }
// })

// app.get('/cart', async (req, res) => {
//     const cookie = req.cookies.jwt;
//     if (!cookie) res.redirect('/login')
//     else {
//         const id = jwt.verify(cookie, process.env.SECRET_KEY);
//         const tmp = await Data.findOne({ _id: id });
//         const user = tmp.name.split(" ", 1);
//         res.render("home.hbs", {
//             iname: user
//         })
//     }
// })

app.get('/contacts', (req, res) => {
    res.sendFile(__dirname + '/src/contact.html')
})

app.get('/login', (req, res) => {
    if (req.cookies.jwt) res.redirect('/');
    else res.sendFile(__dirname + '/src/login.html')
})

app.post('/login', async (req, res) => {
    //console.log(req.body);
    try {
        const tmp = await Data.findOne({ email: req.body.email })
        if (!tmp) res.status(400).send('email id does not exists')
        const check = await bcrypt.compare(req.body.password, tmp.password)
        if (!check) res.status(400).send('password is incorrect')
        const id = tmp._id.valueOf();
        //console.log(id.valueOf()); // get _id as a string from ObjectId
        //console.log(id);
        const uuid = uuidv4();
        console.log(uuid);
        const obj = {
            _id: id,
            rid: uuid
        }
        const token = jwt.sign(obj, process.env.SECRET_KEY)
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 1200000),
            httpOnly: true
        })
        await Data.updateOne({ _id: id }, {
            $push: { tokens: uuid }
        })
        res.redirect('/')
    } catch (error) {
        res.sendStatus(500)
    }
})

app.get('/logout', auth, async (req, res) => {
    res.clearCookie("jwt")
    try {
        const tmp = await Data.findOneAndUpdate({ _id: req.id }, {
            $pull: { tokens: req.rid }
        })
        res.redirect('/')
    } catch (error) {
        res.sendStatus(500)
    }
})

app.get('/register', async (req, res) => {
    if (req.cookies.jwt) res.redirect('/');
    else res.sendFile(__dirname + '/src/register.html')
})

app.post('/register', async (req, res) => {
    try {
        let tmp = await Data.findOne({ email: req.body.email })
        if (tmp) res.redirect('/login')
        else {
            req.body.password = await bcrypt.hash(req.body.password, 10)
            tmp = await Data.create(req.body)
            console.log(tmp);
            res.redirect('/')
        }
    } catch (error) {
        res.sendStatus(502)
    }
})

app.get('/forget', async (req, res) => {
    if (req.cookies.jwt) res.redirect('/');
    else res.sendFile(__dirname + '/src/email_verify.html')
})

app.post('/forget', async (req, res) => {
    try {
        const tmp = await Data.findOne({ email: req.body.email })
        if (!tmp) res.redirect('/register')
        else {
            const sender = {
                email: 'indimart@gmail.com',
                name: 'indiMart'
            }
            const receivers = [{ email: req.body.email }]
            const code = otp()
            const token = jwt.sign({
                otp: code,
                email: req.body.email
            }, process.env.SECRET_KEY)
            res.cookie('code', token, {
                expires: new Date(Date.now() + 300000),
                httpOnly: true
            })
            tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Regarding email verification',
                htmlContent: `Dear Customer,
                
                Your OTP for email verification given below
                
                <h1>${code}</h1>
                
                Best regards,        
                <b>indiMart</b>`
            })
                .then(console.log)
                .catch(console.log)
            if (req.body.active) res.send({})
            else res.render('verify_mail_send.hbs', {
                email: req.body.email
            })
        }
    } catch (error) {
        res.sendStatus(502)
    }
})

app.post('/verify', async (req, res) => {
    try {
        const token = req.cookies.code
        const obj = jwt.verify(token, process.env.SECRET_KEY)
        if (req.body.otp == obj.otp) {
            res.send({
                code: true
            })
        }
        else res.send({
            code: false
        })
    } catch (error) {
        res.redirect('/login')
    }
})

app.get('/password', (req, res) => {
    try {
        const token = req.cookies.code
        const obj = jwt.verify(token, process.env.SECRET_KEY)
        res.sendFile(__dirname+'/src/change_password.html')
    } catch (error) {
        res.redirect('/login')
    }
})

app.patch('/password', async (req, res) => {
    try {
        const token = req.cookies.code
        const obj = jwt.verify(token, process.env.SECRET_KEY)
        req.body.password = await bcrypt.hash(req.body.password, 10)
        try {
            const tmp = await Data.findOneAndUpdate({ email: obj.email }, {
                $set: {
                    password: req.body.password
                }
            })
            console.log(tmp);
            res.send(tmp)
        } catch (error) {
            res.sendStatus(502)
        }
    } catch (error) {
        res.redirect('/login')
    }
})

app.get('/db', async (req, res) => {
    try {
        const tmp = await Data.find()
        res.send(tmp)
    } catch (error) {
        res.sendStatus(500)
    }
})

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/src/error.html')
})

const start = async () => {
    await con(process.env.MONGODB_URL);
    app.listen(PORT, () => {
        console.log('server runs');
    })
}
start();
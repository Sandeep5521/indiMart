const jwt = require('jsonwebtoken')
const path = require('path')
const Data = require('../models/data.js')
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const check = jwt.verify(token, process.env.SECRET_KEY)
        //console.log(check);
        req.rid = check.rid
        req.id = check._id
        next();
    } catch (error) {
        if (req.url == '/') {
            res.sendFile(path.join(__dirname, '../src/index.html'));
        }
        else if (req.url === '/about') {
            res.sendFile(path.join(__dirname, '../src/about.html'));
        }
        else if (String(req.url).match(/product/i) == 'product') {
            if (req.query.cat && req.query.id) res.render("product.hbs", {
                id: req.query.id,
                cat: req.query.cat
            })
            else if (req.query.uid) {
                const user = await Data.findOne({ _id: req.query.uid });
                res.send({
                    image: (user.image) ? user.image.slice(7) : 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp',
                    name: user.name
                })
            }
            else res.sendFile(path.join(__dirname, '../src/error.html'))
        }
        else if (String(req.url).match(/search/i) == 'search') {
            if (req.query.s) res.render("search.hbs", {
                query: req.query.s
            })
            else res.sendFile(path.join(__dirname, '../src/shop.html'));
        }
        else if (String(req.url).match(/shop/i) == 'shop') {
            if (req.query.cat) res.render("category.hbs", {
                shop: req.query.cat
            })
            else res.sendFile(path.join(__dirname, '../src/shop.html'));
        }
        else if (String(req.url).match(/terms/i) == 'terms') {
            res.sendFile(path.join(__dirname, '../src/terms.html'))
        }
        else if (String(req.url).match(/privacy/i) == 'privacy') {
            res.sendFile(path.join(__dirname, '../src/privacy.html'))
        }
        else if (String(req.url).match(/refund/i) == 'refund') {
            res.sendFile(path.join(__dirname, '../src/refund.html'))
        }
        else res.redirect('/login');
    }
}

module.exports = auth;
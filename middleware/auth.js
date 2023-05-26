const jwt = require('jsonwebtoken')
const path = require('path')

const auth = (req, res, next) => {
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
        else res.redirect('/login');
    }
}

module.exports = auth;
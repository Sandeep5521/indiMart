const jwt = require('jsonwebtoken')
const path = require('path')

const auth = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const check = jwt.verify(token,process.env.SECRET_KEY)
        //console.log(check);
        req.rid = check.rid
        req.id = check._id
        next();
    } catch (error) {
        if(req.url == '/'){
            res.sendFile(path.join(__dirname,'../src/index.html'));
        }
        else if(String(req.url).match(/shop/i) == 'shop'){
            if (req.query.cat) res.render("shop.hbs", {
                shop: req.query.cat
            })
            else res.sendFile(path.join(__dirname,'../src/error.html'))
        }
        else res.redirect('/login');
    }
}

module.exports = auth;
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')

const authenticated_routes = require('./router/auth_users.js').authenticated;
const general_routes = require('./router/general.js').general;
const { log } = require("./resources/helpers.js");



const port = 5000;
const app = express();
app.use(express.json());



app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth*fallback", function auth(req, res, next) {
    log(req.method, "/customer/auth*fallback", "query:", req.query, "params:", req.params);

    //dev workaround to skip authentication
    if (req.query.dev) {
        log("Development mode: skipping authentication");
        next();
        return;
    }

    // Check if user is logged in and has a valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(401).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(401).json({ message: "User not logged in" });
    }
});


app.use("/customer", authenticated_routes);
app.use("/", general_routes);


// Define a fallback route for any requests not yet caught
app.all("*fallback", (req, res) => {
    log(req.method, "*fallback", "query:", req.query, "params:", req.params);

    return res.status(404).send('404! Page not found');
});

app.listen(port, () => console.log("Server is running on http://localhost:" + port));

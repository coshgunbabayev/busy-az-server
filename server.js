require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});

const { connection } = require("./db");
connection();

const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
app.use(cookieParser());
app.use(bodyParser.json());
const cors = require("cors");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(methodOverride("_method", {
    methods: ["POST", "GET"]
}));
app.use(cors({
    origin: "https://busy-az-1a5a6a8ac879.herokuapp.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

const { requestNotify } = require("./middlewares/notify")

const userRoute = require("./routes/userRoute").router;
const checkRoute = require("./routes/checkRoute").router;
const vacancyRoute = require("./routes/vacancyRoute").router;

app.use("/api/user", requestNotify, userRoute);
app.use("/api/check", requestNotify, checkRoute);
app.use("/api/vacancy", requestNotify, vacancyRoute);
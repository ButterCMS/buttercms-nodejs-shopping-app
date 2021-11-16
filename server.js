// import the required external libraries
const express = require("express")
const { json, urlencoded } = require("body-parser")
const Butter = require("buttercms")

const { addToCart, getCartItems } = require("./store")

// initialize your butterCMS instance
const butter = Butter("<token>")

// initialize the express application
const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))
// this serves all files in the `public` directory
// and can be used to serve our HTML website
app.use(express.static("public"))
// this renders all "ejs" pages within the `views` directory
app.set("view engine", "ejs")

const port = 3000

// our application can have multiple users, but for now, let's assume there's a single user
// who has this user name
const userName = "sample user"

// start an express server on the given port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get("/products", (req, res) => {
    // get all product page types from the ButterCMS portal
    butter.page
        .list("product")
        .then((resp) => {
            // if successful, return the products in the response
            res.json(resp.data)
        })
        // return an internal server error if the call failed
        .catch((err) => res.status(500).send(err))
})


app.post("/cart", (req, res) => {
    // get the item id from the request and add it to the cart
    addToCart(userName, req.body.itemId)
    res.end()
})

const regionPrice = {
    US: "price",
    EU: "price-euro",
}

app.post("/checkout", (req, res) => {
    // get items from the user’s cart
    const items = getCartItems(userName)

    // create a list of requests to retrieve product information for each item.
    const requests = Object.keys(items).map((key) =>
        butter.page.retrieve("product", key)
    )

    // initialize total to 0
    let total = 0

    // execute all requests simultaneously using Promise.all
    Promise.all(requests)
        .then((responses) => {
            const { region } = req.body
            // once all the info is retrieved, add to the total
            // using the product price and quantity
            const renderItems = responses.map((resp) => {
                const { title } = resp.data.data.fields
                // get the price based on the region and add to total
                const price = resp.data.data.fields[regionPrice[region]]
                const quantity = items[resp.data.data.name]
                total += price * quantity

                // the quantity and title are returned and stored in the
                // renderItems variable
                return {
                    quantity,
                    title,
                }
            })

            // we render the "payment-confirmation" ejs template, by providing
            // the total and the items as template variables
            res.render("payment-confirmation", {
                total,
                items: renderItems,
            })
        })
        // return an internal server error if the API returns an error
        .catch((err) => {
            console.log(err)
            res.status(500).end()
        })
})
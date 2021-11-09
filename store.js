// create a persistent object to hold cart data
// in production, this data would probably be held in a database
const userCarts = {}

const addToCart = (userId, itemId) => {
    // if a user’s cart doesn't exist, create an empty cart
    if (!userCarts[userId]) {
        userCarts[userId] = {}
    }

    // if the given item doesn't exist in the cart, create a new entry
    // for it
    if (!userCarts[userId][itemId]) {
        userCarts[userId][itemId] = 0
    }

    // increase the item quantity by one
    userCarts[userId][itemId] += 1
}

// if the user’s cart exists, return it, or else return an empty object
const getCartItems = (userId) => userCarts[userId] || {}

// export the above methods
module.exports = { addToCart, getCartItems }
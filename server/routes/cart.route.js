import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })
const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET

function getUserIdFromReq(req) {
  // prefer req.user if auth middleware populated it
  const uid = req.user?.id || req.user?._id
  if (uid) return uid

  // otherwise check token
  const token = req.cookies?.token || (req.headers.authorization || '').split(' ')[1]
  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return payload.id || payload._id || null
  } catch (err) {
    console.error('token verify failed in cart route:', err?.message || err)
    return null
  }
}

router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { productId, quantity = 1, name, price, image } = req.body || {};
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let cart = user.cartdata || [];

    // check if product already exists
    const existingIndex = cart.findIndex(item => item.productId === productId);

    if (existingIndex >= 0) {
      // update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // push new item
      cart.push({
        productId,
        name,
        price,
        image,
        quantity,
      });
    }

    user.cartdata = cart;
    await user.save();

    return res.json({ cart: user.cartdata });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req)
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

    const { productId, quantity } = req.body || {}
    if (!productId) return res.status(400).json({ error: 'productId required' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    let cart = user.cartdata || []

    const idx = cart.findIndex(item => item.productId === productId)
    if (idx >= 0) {
      if (Number(quantity) <= 0) {
        cart.splice(idx, 1) // remove item
      } else {
        cart[idx].quantity = Number(quantity)
      }
    }

    user.cartdata = cart
    await user.save()
    return res.json({ cart: user.cartdata })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/cart/:productId -> remove item
router.delete('/:productId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req)
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

    const { productId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    let cart = user.cartdata || []
    cart = cart.filter(item => item.productId !== productId)

    user.cartdata = cart
    await user.save()
    return res.json({ cart: user.cartdata })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router
/* eslint-disable @typescript-eslint/no-explicit-any */
 'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { getCurrentUser } from '@/lib/User'
import { setUser, updateCartQuantity, removeFromCart, addToCart } from '@/redux/userSlice'
import { toast as rtToast } from 'react-toastify'

// --- Type Definitions ---
interface CartItemMeta {
  productId?: string
  id?: string
  quantity?: number
  qty?: number
  name?: string
  price?: number
  image?: string
}

interface UserState {
  name: string | null
  email: string | null
  cartdata: CartItemMeta[] | null
}

// --- Component ---
export default function CartPage() {
  const user = useSelector((state: RootState) => state.user) as UserState
  const dispatch = useDispatch()

  const refreshUser = async () => {
    try {
      const me = await getCurrentUser()
      const u = me?.user ?? me
      if (u) {
        dispatch(
          setUser({
            name: u.name ?? null,
            email: u.email ?? null,
            cartdata: Array.isArray(u.cartdata) ? u.cartdata : [],
            wishlistdata: u.wishlistdata ?? null,
            orderdata: u.orderdata ?? null,
            addressdata: u.addressdata ?? null,
          })
        )
      }
    } catch (e) {
      console.error(e)
    }
  }
  // Animation / timing constants (ms)
  const REMOVE_ANIM_MS = 180 // how long before the row is removed from the DOM after starting animation
  const UNDO_WINDOW_MS = 2000 // how long the user has to undo the remove
  const SLIDE_OUT_MS = 220
  const SLIDE_IN_MS = 280

  // Typed helpers for managing pending removals (keeps casts centralized)
  type PendingRemovalEntry = { item: CartItemMeta; finalizeTimer: ReturnType<typeof setTimeout> | null }
  // pendingRemovals is already declared above; we use helper functions to manipulate it

  function addPendingRemoval(pid: string, item: CartItemMeta, finalizeTimer: ReturnType<typeof setTimeout>) {
    pendingRemovals.current[pid] = { item, finalizeTimer }
  }

  function cancelPendingRemoval(pid: string): CartItemMeta | undefined {
    const entry = pendingRemovals.current[pid]
    if (!entry) return undefined
    if (entry.finalizeTimer) clearTimeout(entry.finalizeTimer)
    delete pendingRemovals.current[pid]
    return entry.item
  }

  // Centralized toast wrapper that accepts JSX content for the undo toast
  function showUndoToast(pid: string, removed: CartItemMeta, onUndo: () => void) {
    const content = (
      <div className="flex items-center gap-3">
        <div className="text-sm">Removed <strong>{removed.name}</strong></div>
        <button className="ml-2 text-xs underline" onClick={onUndo}>Undo</button>
      </div>
    )
    // react-toastify typing in this project can be narrow; keep cast here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (rtToast as any).info(content, { autoClose: UNDO_WINDOW_MS })
    return id as number
  }

  // Remove item: animate out, optimistic remove, schedule finalize; undo restores
  function removeItem(pid: string) {
    // find the item immediately so we can show toast right away
    const removed = cartItems.find((c) => (c.productId || c.id) === pid)
    if (!removed) return

    // mark row as removing (plays slide-out animation)
    setRemovingRows((s) => ({ ...s, [pid]: true }))

    // schedule server finalize after undo window (start timer immediately)
    const finalizeTimer = setTimeout(async () => {
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
        await fetch(`${API}/api/cart/${pid}`, { method: 'DELETE', credentials: 'include' })
      } catch (err) {
        console.error(err)
      } finally {
        refreshUser()
      }
    }, UNDO_WINDOW_MS)

    addPendingRemoval(pid, removed, finalizeTimer)

    // show undo toast immediately with the removed product info
    showUndoToast(pid, removed, () => {
      const item = cancelPendingRemoval(pid)
      if (!item) return

      // restore locally
      dispatch(addToCart({ id: String(item.productId || item.id), name: item.name || '', price: Number(item.price || 0), quantity: Number(item.quantity || item.qty || 1), image: item.image }))
      setLocalQuantities((s) => ({ ...s, [pid]: Number(item.quantity || item.qty || 1) }))

      // clear removing state so the restored row animates back in correctly
      setRemovingRows((s) => {
        const copy = { ...s }
        delete copy[pid]
        return copy
      })

      // animate slide-in from right
      setRestoringRows((s) => ({ ...s, [pid]: true }))
      setTimeout(() => setRestoringRows((s) => {
        const copy = { ...s }
        delete copy[pid]
        return copy
      }), SLIDE_IN_MS)

      refreshUser()
    })

    // actually remove from local UI state after a short delay so the slide-out animation can play
    setTimeout(() => {
      dispatch(removeFromCart(pid))
      setLocalQuantities((s) => {
        const next = { ...s }
        delete next[pid]
        return next
      })

      // clear removingRows state for cleanliness (row is removed from DOM via redux)
      setRemovingRows((s) => {
        const copy = { ...s }
        delete copy[pid]
        return copy
      })
    }, REMOVE_ANIM_MS)
  }

  // Normalize cart items
  const cartItems: CartItemMeta[] = useMemo(() => {
    return Array.isArray(user?.cartdata) ? user.cartdata : []
  }, [user])

  const itemCount = cartItems.length

  // Local state for quantities
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
  const [availableMap, setAvailableMap] = useState<Record<string, number>>({})

  // ✅ Sync localQuantities whenever cartdata changes
  useEffect(() => {
    if (Array.isArray(user?.cartdata)) {
      const synced = user.cartdata.reduce((acc, item) => {
        const pid = item.productId || item.id!
        acc[pid] = Number(item.quantity || item.qty || 1)
        return acc
      }, {} as Record<string, number>)
      setLocalQuantities(synced)
    }
  }, [user?.cartdata])

  // fetch product stock for items (map of pid -> quantity)
  useEffect(() => {
    let mounted = true
    const loadStocks = async () => {
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
        const ids = cartItems.map(it => it.productId || it.id!).filter(Boolean)
        if (ids.length === 0) {
          if (mounted) setAvailableMap({})
          return
        }

        const res = await fetch(`${API}/api/products/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        })
        if (!res.ok) return
        const json = await res.json()
        const prods: Array<any> = json.products || []
        const map: Record<string, number> = {}
        prods.forEach(p => {
          if (!p) return
          const keyById = String(p._id)
          map[keyById] = Number(p.quantity || 0)
          if (typeof p.productId !== 'undefined') map[String(p.productId)] = Number(p.quantity || 0)
        })
        if (mounted) setAvailableMap(map)
      } catch (e) {
        console.error('loadStocks error', e)
      }
    }
    loadStocks()
    return () => { mounted = false }
  }, [cartItems])

  // per-item debounce timers
  const timers = useRef<Record<string, number | null>>({})
  // visual bump timers for quantity change animations
  const bumpTimers = useRef<Record<string, number | null>>({})
  const [bumped, setBumped] = useState<Record<string, boolean>>({})
  // last change direction per item: 1 => increment, -1 => decrement
  const [lastDelta, setLastDelta] = useState<Record<string, number>>({})
  // pending removals waiting for undo (pid -> { item, finalizeTimer })
  const pendingRemovals = useRef<Record<string, { item: CartItemMeta; finalizeTimer: ReturnType<typeof setTimeout> | null }>>({})
  // rows currently animating out
  const [removingRows, setRemovingRows] = useState<Record<string, boolean>>({})
    // rows that were just restored (slide-in animation)
    const [restoringRows, setRestoringRows] = useState<Record<string, boolean>>({})
    const restoringTimers = useRef<Record<string, number | null>>({})

  const updateQuantity = (pid: string, change: number) => {
    const currentQty = localQuantities[pid] || 1
    const desired = Math.max(currentQty + change, 1)

    // enforce client-side cap if we know available stock
    const available = availableMap[pid]
    const newQty = typeof available === 'number' && available >= 0 ? Math.min(desired, available) : desired

    // optimistic UI update
    setLocalQuantities((prev) => ({ ...prev, [pid]: newQty }))
    dispatch(updateCartQuantity({ id: pid, quantity: newQty }))

    // visual bump animation for the qty number + remember direction for coloring
    setBumped((prev) => ({ ...prev, [pid]: true }))
    setLastDelta((prev) => ({ ...prev, [pid]: Math.sign(change) || 0 }))
    if (bumpTimers.current[pid]) window.clearTimeout(bumpTimers.current[pid]!)
    bumpTimers.current[pid] = window.setTimeout(() => {
      setBumped((prev) => ({ ...prev, [pid]: false }))
      setLastDelta((prev) => ({ ...prev, [pid]: 0 }))
      bumpTimers.current[pid] = null
    }, 420)

    // debounce server patch to coalesce rapid clicks
    if (timers.current[pid]) window.clearTimeout(timers.current[pid]!)
    timers.current[pid] = window.setTimeout(async () => {
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
        const res = await fetch(`${API}/api/cart`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: pid, quantity: newQty }),
        })
        if (!res.ok) throw new Error('Failed to update quantity')
        await refreshUser()
      } catch (e) {
        console.error(e)
      }
    }, 220)
  }

  

  // Calculate total price
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const pid = item.productId || item.id!
      const qty = localQuantities[pid] || Number(item.quantity || item.qty || 1)
      const price = Number(item.price || 0)
      return sum + price * qty
    }, 0)
  }, [cartItems, localQuantities])

  // small animation when total changes (accessibility + visual feedback)
  const [totalBumped, setTotalBumped] = useState(false)
  useEffect(() => {
    // animate briefly when total updates
    setTotalBumped(true)
    const t = window.setTimeout(() => setTotalBumped(false), 350)
    return () => clearTimeout(t)
  }, [totalPrice])

  if (!user?.email)
    return (
      <div className="bg-veblyssBackground min-h-screen flex items-center justify-center">
        <p className="text-veblyssText">Please login to view your cart</p>
      </div>
    )

  return (
    <div className="bg-veblyssBackground min-h-screen pb-16">
      <section className="py-20 text-center">
        <h1 className="font-playfair text-4xl md:text-6xl text-[#FFECE0] mb-4">
          Your Cart ({itemCount})
        </h1>
        <p className="font-opensans text-veblyssTextLight max-w-2xl mx-auto">
          Items in your cart. Proceed to checkout when ready.
        </p>
      </section>

      <section className="container mx-auto px-4">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <h2 className="font-playfair text-2xl mb-4">Your cart is empty</h2>
            <p className="text-veblyssText mb-6">Browse products and add items to your cart.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 rounded-xl font-bold bg-[#368581] text-[#FAF9F6]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="max-h-[600px] overflow-y-auto space-y-4">
              {cartItems.map((item) => {
                const pid = item.productId || item.id!
                const qty = localQuantities[pid] || Number(item.quantity || item.qty || 1)
                const price = Number(item.price || 0)
                const subtotal = price * qty

                return (
                  <div
                    key={pid}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden flex items-center p-2 gap-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${removingRows[pid] ? 'animate-slide-out opacity-0 pointer-events-none' : ''} ${restoringRows[pid] ? 'animate-slide-in' : ''}`}
                    aria-label={`${item.name} in cart`}
                  >
                    <div className="w-32 h-32 bg-gray-100 relative flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1">
                      <h3 className="font-playfair text-xl font-semibold text-veblyssText mb-2">
                        <Link href={`/products/${item.productId || item.id}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`text-2xl font-bold transition-colors duration-200 ${bumped[pid] ? 'text-emerald-600' : ''}`}>₹{price.toFixed(2)}</span>
                        <span className={`text-sm ml-2 transition-transform duration-200 ${lastDelta[pid] === 1 ? 'text-emerald-600 scale-105' : lastDelta[pid] === -1 ? 'text-red-500 scale-105' : 'text-gray-500'}`}>Subtotal: ₹{subtotal.toFixed(2)}</span>
                      </div>

                      {/* Quantity Controls - unified, animated */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(pid, -1)}
                          aria-label={`Decrease quantity for ${item.name}`}
                          className="w-10 h-10 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-transform hover:scale-105 duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-veblyssText" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>

                        <div className={`px-4 py-2 border rounded-lg font-mono text-lg transition-transform duration-200 ${bumped[pid] ? 'scale-110 text-emerald-600' : ''}`}>
                          {qty}
                        </div>

                        <button
                          onClick={() => updateQuantity(pid, 1)}
                          disabled={typeof availableMap[pid] === 'number' && qty >= availableMap[pid]}
                          aria-disabled={typeof availableMap[pid] === 'number' && qty >= availableMap[pid]}
                          title={typeof availableMap[pid] === 'number' && qty >= availableMap[pid] ? 'Reached available stock' : 'Increase quantity'}
                          className={
                            "w-10 h-10 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-transform hover:scale-105 duration-150 " +
                            (typeof availableMap[pid] === 'number' && qty >= availableMap[pid] ? 'opacity-50 cursor-not-allowed hover:scale-100' : '')
                          }
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-veblyssText" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>

                        <button
                          onClick={() => removeItem(pid)}
                          className="ml-auto px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 7a1 1 0 012 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" clipRule="evenodd" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total Price & Checkout */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-right flex flex-col md:flex-row justify-between items-center mt-6 sticky bottom-0 z-10">
              <span className={`text-xl md:text-2xl font-bold text-veblyssText transition-transform duration-250 ${totalBumped ? 'scale-105 text-emerald-600' : ''}`}>
                Total: ₹{totalPrice.toFixed(2)}
              </span>
              {/* Announce changes to assistive tech */}
              <div aria-live="polite" className="sr-only">
                Total updated to ₹{totalPrice.toFixed(2)}
              </div>
              <button
                onClick={() => alert('Temporary checkout clicked!')}
                className="mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold bg-[#368581] text-[#FAF9F6] transition-transform hover:scale-105 duration-300"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </section>
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-12px); }
        }
  .animate-slide-in { animation: slideIn 280ms ease-out both; }
  .animate-slide-out { animation: slideOut 220ms ease-in both; }
      `}</style>
    </div>
  )
}

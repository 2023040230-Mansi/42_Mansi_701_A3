import React, { useEffect, useState } from 'react'

export default function Shop({ showCart }){
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(()=>{ fetchCategories(); fetchProducts(); loadCart(); }, [])

  async function fetchCategories(){
    const r = await fetch('http://localhost:3010/api/categories')
    const j = await r.json()
    setCategories(j)
  }

  async function fetchProducts(cat){
    const url = cat ? `http://localhost:3010/api/products?category=${cat}` : 'http://localhost:3010/api/products'
    const r = await fetch(url)
    const j = await r.json()
    setProducts(j)
  }

  async function addToCart(productId){
    await fetch('http://localhost:3010/api/cart/add', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ productId, qty:1 }) })
    loadCart()
  }

  async function loadCart(){
    const r = await fetch('http://localhost:3010/api/cart')
    const j = await r.json()
    setCart(j)
  }

  return (
    <div>
      <h3>Shop</h3>
      <div style={{display:'flex',gap:20}}>
        <div style={{minWidth:220}}>
          <h4>Categories</h4>
          <ul>
            <li><button onClick={()=>{ setSelectedCategory(''); fetchProducts(); }}>All</button></li>
            {categories.map(c=> (
              <li key={c._id}><button onClick={()=>{ setSelectedCategory(c._id); fetchProducts(c._id) }}>{c.name}</button></li>
            ))}
          </ul>
        </div>

        <div style={{flex:1}}>
          <h4>Products</h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {products.map(p=> (
              <div key={p._id} style={{border:'1px solid #ddd',padding:8}}>
                <h5>{p.name}</h5>
                <div>{p.description}</div>
                <div>Price: ₹{p.price}</div>
                <div>Stock: {p.stock}</div>
                <button onClick={()=>addToCart(p._id)}>Add to cart</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{minWidth:260}}>
          <h4>Cart</h4>
          <button onClick={loadCart}>Refresh</button>
          <ul>
            {cart.map(item=> (
              <li key={item.product._id}>{item.product.name} x {item.qty} - ₹{item.product.price * item.qty}</li>
            ))}
          </ul>
          <button onClick={async()=>{ await fetch('http://localhost:3010/api/cart/clear', { method:'POST' }); loadCart(); }}>Clear Cart</button>
        </div>
      </div>
    </div>
  )
}

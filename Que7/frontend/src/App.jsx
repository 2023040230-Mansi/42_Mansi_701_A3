import React, { useEffect, useState } from 'react'
import Shop from './pages/Shop'
import Admin from './pages/Admin'

export default function App(){
  const [view, setView] = useState('shop')
  return (
    <div style={{padding:20}}>
      <h1>Shopping Portal</h1>
      <nav style={{marginBottom:12}}>
        <button onClick={()=>setView('shop')}>Shop</button>
        <button onClick={()=>setView('cart')}>Cart</button>
        <button onClick={()=>setView('admin')}>Admin</button>
      </nav>
      <div>
        {view === 'shop' && <Shop />}
        {view === 'cart' && <Shop showCart />}
        {view === 'admin' && <Admin />}
      </div>
    </div>
  )
}

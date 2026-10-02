import React, { useEffect, useState } from 'react'

export default function Admin(){
  const [cats, setCats] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name:'', parent:'' })
  const [pform, setPform] = useState({ name:'', description:'', price:0, stock:0, category:'' })

  useEffect(()=>{ loadCats(); loadProducts() }, [])

  async function loadCats(){
    const r = await fetch('http://localhost:3010/admin/categories')
    const j = await r.json(); setCats(j)
  }

  async function loadProducts(){
    const r = await fetch('http://localhost:3010/admin/products')
    const j = await r.json(); setProducts(j)
  }

  async function addCat(){
    await fetch('http://localhost:3010/admin/categories', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(form) })
    setForm({ name:'', parent:'' }); loadCats();
  }

  async function addProduct(){
    await fetch('http://localhost:3010/admin/products', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(pform) })
    setPform({ name:'', description:'', price:0, stock:0, category:'' }); loadProducts();
  }

  return (
    <div>
      <h3>Admin</h3>
      <div style={{display:'flex',gap:20}}>
        <div>
          <h4>Add Category</h4>
          <input placeholder="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <select value={form.parent} onChange={e=>setForm({...form,parent:e.target.value})}>
            <option value="">(no parent)</option>
            {cats.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={addCat}>Add</button>

          <h4>Existing Categories</h4>
          <ul>{cats.map(c=> <li key={c._id}>{c.name}</li>)}</ul>
        </div>

        <div>
          <h4>Add Product</h4>
          <input placeholder="name" value={pform.name} onChange={e=>setPform({...pform,name:e.target.value})} /><br />
          <input placeholder="description" value={pform.description} onChange={e=>setPform({...pform,description:e.target.value})} /><br />
          <input type="number" placeholder="price" value={pform.price} onChange={e=>setPform({...pform,price:e.target.value})} /><br />
          <input type="number" placeholder="stock" value={pform.stock} onChange={e=>setPform({...pform,stock:e.target.value})} /><br />
          <select value={pform.category} onChange={e=>setPform({...pform,category:e.target.value})}>
            <option value="">(no category)</option>
            {cats.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
          </select><br />
          <button onClick={addProduct}>Add Product</button>

          <h4>Products</h4>
          <ul>{products.map(p=> <li key={p._id}>{p.name} - ₹{p.price} ({p.category? p.category.name:'-'})</li>)}</ul>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitle from './pages/BlogTitle'
import Generateimages from './pages/Generateimages'
import Removebg from './pages/Removebg'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import Comunity from './pages/Comunity'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import {Toaster} from 'react-hot-toast'

const App = () => {

  return (
    <div>
      <Toaster />
      <Routes>
         <Route path='/' element={<Home/>}/>
         <Route path='/ai' element={<Layout/>}>
           <Route index element={<Dashboard/>}/>
           <Route path='write-article' element={<WriteArticle/>} />
           <Route path='blog-titles' element={<BlogTitle/>} />
           <Route path='generate-images' element={<Generateimages/>}/>
           <Route path='remove-bg' element={<Removebg/>}/>
           <Route path='remove-object' element={<RemoveObject/>}/>
           <Route path='review-resume' element={<ReviewResume/>}/>
           <Route path='comunity' element={<Comunity/>}/>
         </Route>
      </Routes>
    </div>
  )
}

export default App
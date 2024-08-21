import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {Login,Dashboard,ApplicationForm,ValidatorsReport,About,Policy} from './pages'

import './App.css'
import LoginRoot from './components/LoginRoot/LoginRoot'
import ErrorComponent from '../src/components/ErrorComponent';
import DashboardRoot, { applicantLoader, validatorLoader } from './components/DashboardRoot/DashboardRoot'

const router = createBrowserRouter([
  {path:'/',element: <LoginRoot/>, children:[
    {index:true,element: <Login/> },
    {path:'about',element: <About/> },
    {path:'policy',element: <Policy/>}
  ]},
  {path:'/applicant',element: <DashboardRoot role="Applicant"/>, loader: applicantLoader, errorElement: <ErrorComponent/>,
    children:[
    {path:'dashboard',element: <Dashboard role="Applicant"/>, children:[
      {path:':status',element: <Dashboard role="Applicant"/> }
    ]},
    {path:'form',element: <ApplicationForm/> },
    {path:'faqs',element: <h1>FAQs</h1> },
    {path:'contact-us',element: <h1>contact-us</h1> },
  ]},
    
  {path:'/validator',element: <DashboardRoot role="Validator"/>, loader: validatorLoader, errorElement: <ErrorComponent/>,
    children:[
    {path:'dashboard',element: <Dashboard role="Validator"/>, children:[
      {path:':status',element: <Dashboard role="Validator"/> }
    ]},
    {path:'report',element: <ValidatorsReport/>}
  ]},
])

function App() {
  return <RouterProvider router={router}/>
}

export default App

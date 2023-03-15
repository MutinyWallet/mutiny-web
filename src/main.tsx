import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from '@/App'
import Scanner from '@/routes/Scanner';
import './index.css'
import { fetchApprovedStatus } from './utils/fetchApprovedLoader';
import Layout from './components/Layout';

let waitlist_id = localStorage.getItem('waitlist_id')

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        loader: async () => { return fetchApprovedStatus(waitlist_id || "") },
        index: true,
        element: <App />,
      },
      {
        path: "scanner",
        element: <Scanner />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)

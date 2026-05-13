import { createBrowserRouter } from 'react-router';
import App from '../App';
import PageLayout from '../layouts/PageLayout/PageLayout';

const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [{ path: '/', element: <App /> }],
  },
]);

export default router;

import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import Root, {loader as rootLoader, action as rootAction} from './routes/Root';
import ErrorPage from './ErrorPage';
import Contact, {loader as contactLoader, action as contactAction} from './routes/Contact';
import EditContact, {action as editAction} from './routes/Edit';
import {action as destroyAction} from './routes/Destroy';
import Index from './routes/Index';

const router = createBrowserRouter([
    {
        path: '/',
        element: (<Root />),
        errorElement: (<ErrorPage />),
        loader: rootLoader, // cargamos un hook en la ruta que cargue los datos
        action: rootAction, // intercepta los elementos form
        children: [
            {
                errorElement: (<ErrorPage />),
                children: [
                    { 
                        index: true, 
                        element: (<Index />)
                    },
                    {
                        path: 'contacts/:contactId',
                        element: (<Contact />),
                        loader: contactLoader,
                        action: contactAction,
                    },
                    {
                        path: 'contacts/:contactId/edit',
                        element: (<EditContact />),
                        loader: contactLoader,
                        action: editAction
                    },
                    {
                        path: 'contacts/:contactId/destroy',
                        action: destroyAction,
                        errorElement: (<div>Oops! There was an error.</div>)
                    },
                ]
            },
        ]
    },
]);

const App = () => {
    return (
        <RouterProvider router={router} />
    );
}

export default App;
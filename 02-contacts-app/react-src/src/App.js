import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import Root, {loader as rootLoader, action as rootAction} from './routes/Root';
import ErrorPage from './ErrorPage';
import Contact, {loader as contactLoader} from './routes/Contact';
import EditContact, {action as editAction} from './routes/Edit';

const router = createBrowserRouter([
    {
        path: '/',
        element: (<Root />),
        errorElement: (<ErrorPage />),
        loader: rootLoader, // cargamos un hook en la ruta que cargue los datos
        action: rootAction, // intercepta los elementos form
        children: [
            {
                path: 'contacts/:contactId',
                element: (<Contact />),
                loader: contactLoader
            },
            {
                path: 'contacts/:contactId/edit',
                element: (<EditContact />),
                loader: contactLoader,
                action: editAction
            }
        ]
    },
]);

const App = () => {
    return (
        <RouterProvider router={router} />
    );
}

export default App;
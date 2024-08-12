import React from 'react';
import {Form, redirect, useLoaderData} from 'react-router-dom';
import { updateContact } from '../contacts';

const action = async ({request, params}) => {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData); // transforma a un objeto js

    // actualizamos el api
    await updateContact(params.contactId, updates);

    // redireccionamos
    return redirect(`/contacts/${params.contactId}`);
};

const EditContact = () => {
    const {contact} = useLoaderData();

    return (
        <Form method="POST" id="contact-form">
            <p>
                <span>Name</span>
                <input 
                    placeholder="First"
                    aria-label="First name"
                    type="text"
                    name="first"
                    defaultValue={contact?.first} 
                />
                <input
                    placeholder="Last"
                    aria-label="Last name"
                    type="text"
                    name="last"
                    defaultValue={contact?.last}
                />
            </p>
            <label>
                <span>Twitter</span>
                <input 
                    type="text"
                    name="twitter"
                    placeholder="@jack"
                    defaultValue={contact?.twitter}
                />
            </label>
            <label>
                <span>Avatar URL</span>
                <input
                    placeholder="https://example.com/avatar.jpg"
                    aria-label="Avatar URL"
                    type="text"
                    name="avatar"
                    defaultValue={contact?.avatar}
                />
            </label>
            <label>
                <span>Notes</span>
                <textarea
                    name="notes"
                    defaultValue={contact?.notes}
                    rows={6}
                />
            </label>
            <p>
                <button type="submit">Save</button>
                <button type="button">Cancel</button>
            </p>
        </Form>
    )
}

export {action}
export default EditContact;
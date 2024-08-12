import React from 'react';
import {Outlet, Link, useLoaderData, Form} from 'react-router-dom';
import {getContacts, createContact} from '../contacts';

const loader = async () => {
    const contacts = await getContacts();
    return {contacts};
};

const action = async () => {
    const contact = await createContact();
    return {contact};
};

const Root = () => {
    const {contacts} = useLoaderData();
    // console.log(contacts);

    return (
        <>
            <div id="sidebar">
                <h1>React router Contacts</h1>
                <div>
                    <form role="search" id="search-form">
                        <input  aria-label="Search contacts" type="search" name="q" id="q" placeholder="search" />
                        <div id="search-spinner" aria-hidden hidden={true}></div>
                        <div className="sr-only" aria-live="polite"></div>
                    </form>
                    <Form method="post">
                        <button type="submit">New</button>
                    </Form>
                </div>
                <nav>
                    {contacts.length ? (
                        <ul>
                            {contacts.map(contact => (
                                <li key={contact.id}>
                                    <Link to={`contacts/${contact.id}`}>
                                        {contact.first || contact.last ? (
                                            <>
                                                {contact.first} {contact.last}
                                            </>
                                            ) : (
                                            <i>No Name</i>
                                        )}{" "}
                                        {contact.favorite && <span>★</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p><i>No contacts</i></p>
                    )}
                </nav>
            </div>
            <div id="detail">
                <Outlet />
            </div>
        </>
    );
}

export { loader, action };
export default Root;
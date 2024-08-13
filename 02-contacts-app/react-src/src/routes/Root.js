import React, { useEffect, useRef } from 'react';
import {Outlet, NavLink, useLoaderData, Form, redirect, useNavigation, useSubmit} from 'react-router-dom';
import {getContacts, createContact} from '../contacts';

const loader = async ({request}) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const contacts = await getContacts(query);
    return {contacts, query};
};

const action = async () => {
    const contact = await createContact();
    return redirect(`/contacts/${contact.id}/edit`);
};

const Root = () => {
    const {contacts, query} = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();

    /** @type {React.MutableRefObject<HTMLInputElement | null>} */
    const inputRef = useRef(null);

    const searching = navigation.location && 
        new URLSearchParams(navigation.location.search).has('q')

    useEffect(() => {
        if (!inputRef.current) return;

        inputRef.current.value = query;
        
    }, [query]);

    return (
        <>
            <div id="sidebar">
                <h1>React router Contacts</h1>
                <div>
                    <Form role="search" id="search-form">
                        <input 
                            className={searching ? 'loading' : ''}
                            ref={inputRef}
                            defaultValue={query} 
                            aria-label="Search contacts" 
                            type="search" 
                            name="q" 
                            id="q" 
                            placeholder="search" 
                            onChange={event => {
                                submit(event.target.form);
                            }}
                        />
                        <div id="search-spinner" aria-hidden hidden={!searching}></div>
                        <div className="sr-only" aria-live="polite"></div>
                    </Form>
                    <Form method="post">
                        <button type="submit">New</button>
                    </Form>
                </div>
                <nav>
                    {contacts.length ? (
                        <ul>
                            {contacts.map(contact => (
                                <li key={contact.id}>
                                    <NavLink 
                                        to={`contacts/${contact.id}`}
                                        className={({ isActive, isPending }) =>
                                            isActive
                                              ? "active"
                                              : isPending
                                                ? "pending"
                                                : ""
                                        }    
                                    >
                                        {contact.first || contact.last ? (
                                            <>
                                                {contact.first} {contact.last}
                                            </>
                                            ) : (
                                            <i>No Name</i>
                                        )}{" "}
                                        {contact.favorite && <span>★</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p><i>No contacts</i></p>
                    )}
                </nav>
            </div>
            <div id="detail" className={navigation.state === 'loading' ? 'loading' : ''}>
                <Outlet />
            </div>
        </>
    );
}

export {loader, action};
export default Root;
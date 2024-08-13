import React from 'react';
import {Form, useLoaderData, useFetcher} from 'react-router-dom';
import {getContact, updateContact} from '../contacts';

const loader = async ({params}) => {
    const contact = await getContact(params.contactId);

    if (!contact) {
        throw new Response('', {
            status: 404,
            statusText: 'Not found'
        });
    }

    return {contact};
};

const action = async ({request, params}) => {
    const formData = await request.formData();
    return updateContact(params.contactId, {
        favorite: formData.get('favorite') === 'true',
    });
};

const Contact = () => {
    // extraemos los datos del loader usando el hook
    const {contact} = useLoaderData();
    // console.log(contact);

    /**
     * 
     * @param {React.FormEvent<HTMLFormElement>} event 
     */
    const handleSubmit = event => {
        if (!confirm("Please confirm you want to delete this record.")) event.preventDefault();
    };

    return (
        <div id="contact">
            <div>
                <img 
                    src={contact.avatar || `https://robohash.org/${contact.id}.png?size=200x200`} 
                    alt="avatar" 
                />
            </div>
            <div>
                <h1>
                    {(contact.first || contact.last) ? (
                        <>{contact.first} {contact.last}</>
                    ) : (
                        <i>No name</i>
                    )}{" "}
                    <Favorite contact={contact} />
                </h1>
                {contact.twitter && (
                    <p><a target="_blank" href={`https://x.com/${contact.twitter}`}>{contact.twitter}</a></p>
                )}
                {contact.notes && (<p>{contact.notes}</p>)}
                <div>
                    <Form action="edit">
                        <button type="submit">Edit</button>
                    </Form>
                    <Form method="POST" action="destroy" onSubmit={handleSubmit}>
                        <button type="submit">Delete</button>
                    </Form>
                </div>

            </div>
        </div>
    )
};

const Favorite = ({contact}) => {
    const Fetcher = useFetcher();
    const favorite = Fetcher.formData ? 
        Fetcher.formData.get('favorite') === 'true' : 
        contact.favorite; 

    return (
        <Fetcher.Form method="post">
            <button
                name="favorite"
                value={favorite ? 'false': 'true'}
                aria-label={favorite ? 'Remove to favorites' : 'Add to favorites'}    
            > {favorite ? "★" : "☆"}</button>
        </Fetcher.Form>
    )
}

export {loader, action};
export default Contact;
import {redirect} from 'react-router-dom';
import {deleteContact} from '../contacts';

const action = async ({params}) => {
    await deleteContact(params.contactId);
    return redirect('/');
}

export {action};
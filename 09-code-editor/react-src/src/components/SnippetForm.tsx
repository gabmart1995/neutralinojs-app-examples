import {extensions, filesystem} from '@neutralinojs/lib';
import {extension} from '../events';
import { useContext, useState } from 'react';
import { FileContext } from '../context/file_context';
import toast from 'react-hot-toast';

const SnippetForm = () => {
    const fileContext = useContext(FileContext);
    const [snippetName, setSnippetName] = useState('');

    const handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void = async event => {
        event.preventDefault();
        
        try {
            const homeDirectory = sessionStorage.getItem('home_directory') ?? '';
            await extensions.dispatch(extension, 'join', [homeDirectory, 'neu-files', snippetName]);
            
            // esperamos un segundo y medio para que establezca el nuevo path
            // y escriba el archivo
            setTimeout(async () => {
                const path = sessionStorage.getItem('path') ?? '';
                await filesystem.writeFile(path, '');

                // actualizamos los estados
                fileContext.addSnippetName(snippetName);
                setSnippetName('');

                // notificamos al usuario
                toast.success('Snippet guardado', {
                    duration: 2000,
                    position: 'bottom-right',
                    style: {
                        background: '#202020',
                        color: 'white'
                    },

                });
            }, 1500);
            
        } catch (error) {
            console.log('error write');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                value={snippetName}
                onChange={event => setSnippetName(event.target.value)}
                type="text"
                placeholder="write a snippet"
                className="bg-zinc-900 w-full border-none outline-none p-4" 
            />
            <button className="hidden">Save</button>
        </form>
    );
}

export default SnippetForm;
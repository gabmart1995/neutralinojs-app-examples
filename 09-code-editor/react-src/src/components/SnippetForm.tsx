import {os} from '@neutralinojs/lib';

const SnippetForm = () => {
    const handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void = async event => {
        event.preventDefault();
        await os.showMessageBox('alert', 'form submitted');
    }

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text"
                placeholder="write a snippet"
                className="bg-zinc-900 w-full border-none outline-none p-4" 
            />
            <button className="hidden">Save</button>
        </form>
    );
}

export default SnippetForm;
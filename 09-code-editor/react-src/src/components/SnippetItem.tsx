import toast from "react-hot-toast";
import { useContext } from "react";
import { FiTrash, FiX } from 'react-icons/fi'
import { FileContext } from "../context/file_context";
import { extension } from "../events";
import { extensions, filesystem } from "@neutralinojs/lib";
import { loadFiles } from "../helpers/helpers-functions";

const SnippetItem: React.FC<{snippetName: string}> = ({snippetName}) => {
    const fileContext = useContext(FileContext);
    
    const handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void = async _ => {
        try {
            const homeDirectory = sessionStorage.getItem('home_directory') ?? '';
            await extensions.dispatch(extension, 'join', [homeDirectory, 'neu-files', snippetName]);

            setTimeout(async () => {
                const path = sessionStorage.getItem('path') ?? '';
                // console.log({pathRead: path});
                
                const code = await filesystem.readFile(path);

                fileContext.setSelectedSnippet({name: snippetName, code});
            }, 1500);

        } catch (error) {
            console.error(error);
        }
    }; 

    const handleDelete: (event: React.MouseEvent<SVGElement, MouseEvent>) => void = async event => {
        event.stopPropagation();

        const accept = window.confirm('Are sure you want delete that snippet??');
        if (!accept) return;

        try {
            const homeDirectory = sessionStorage.getItem('home_directory') ?? '';
            await extensions.dispatch(extension, 'join', [homeDirectory, 'neu-files', snippetName]);

            setTimeout(async () => {
                const path = sessionStorage.getItem('path') ?? '';
                await filesystem.remove(path);

                fileContext.removeSnippetName(snippetName);

                const files = await loadFiles();
                fileContext.setSnippetNames(files);

                // notificamos al usuario
                toast.success('Snippet eliminado', {
                    duration: 2000,
                    position: 'bottom-right',
                    style: {
                        background: '#202020',
                        color: 'white'
                    },

                });
            }, 1500);

        } catch (error) {
            console.error(error);
        }
    };

    const handleCancel: (event: React.MouseEvent<SVGElement, MouseEvent>) => void = event => {
        event.stopPropagation();
        fileContext.setSelectedSnippet(null);
    };

    // indica cual snippet esta seleccionado
    const selectedSnippet = fileContext.selectedSnippet?.name === snippetName;
    
    return (
        <div 
            onClick={handleClick} 
            className={
                "py-2 px-4 hover:bg-neutral-900 hover:cursor-pointer flex justify-between " + 
                (selectedSnippet ? "bg-sky-500" : "bg-zinc-900")
            }   
        >
            <h1>{snippetName}</h1>
            {selectedSnippet && (
                <div className="flex gap-2">
                    <FiTrash
                        className="text-neutral-500" 
                        onClick={handleDelete}
                    />
                    <FiX 
                        className="text-neutral-500" 
                        onClick={handleCancel}
                    />
                </div>
            )}
        </div>
    )
}

export default SnippetItem;
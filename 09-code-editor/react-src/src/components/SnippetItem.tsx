import { useContext } from "react";
import { FileContext } from "../context/file_context";
import { extension } from "../events";
import { extensions, filesystem } from "@neutralinojs/lib";

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

    // indica cual snippet esta seleccionado
    const selectedSnippet = fileContext.selectedSnippet?.name === snippetName;
    
    return (
        <div 
            onClick={handleClick} 
            className={
                "py-2 px-4 hover:bg-neutral-900 hover:cursor-pointer " + 
                (selectedSnippet ? "bg-yellow-500 " : "bg-zinc-900 ")
            }   
        >
            <h1>{snippetName}</h1>
        </div>
    )
}

export default SnippetItem;
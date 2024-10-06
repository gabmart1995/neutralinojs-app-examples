import { filesystem, storage, extensions } from "@neutralinojs/lib";
import { useContext, useEffect } from "react";
import { extension } from "../events";
import { FileContext } from "../context/file_context";
import SnippetItem from "./SnippetItem";

const SnippetList = () => {
    const fileContext = useContext(FileContext);
    
    useEffect(() => {
        const loadFiles = async () => {
            try {
                const homeDirectory = sessionStorage.getItem('home_directory') ?? '';
                await extensions.dispatch(extension, 'join', [homeDirectory, 'neu-files']);
                
                setTimeout(async () => {
                    // console.log(sessionStorage.getItem('path'));
                    const files = await filesystem.readDirectory(sessionStorage.getItem('path') ?? '');   
                    const names = files.map(file => file.entry);
                    
                    // console.log(files);

                    // establecemos el nombre de los archivos
                    fileContext.setSnippetNames(names);
                }, 1500);
                
            } catch (error) {
                // console.log('error')
                console.error(error);
            }
        };

        loadFiles();
    }, []);
    
    return (
        <div>
            {fileContext.snippetsNames.length > 0 && fileContext.snippetsNames.map((snippetName, index) => (
                <SnippetItem key={index} snippetName={snippetName} />
            ))}
        </div>
    )
}

export default SnippetList;
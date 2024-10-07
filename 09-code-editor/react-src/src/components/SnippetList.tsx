import { filesystem, storage, extensions } from "@neutralinojs/lib";
import { useContext, useEffect } from "react";
import { extension } from "../events";
import { FileContext } from "../context/file_context";
import SnippetItem from "./SnippetItem";
import { loadFiles } from "../helpers/helpers-functions";

const SnippetList = () => {
    const fileContext = useContext(FileContext);
    
    useEffect(() => {
        loadFiles()
            .then(files => fileContext.setSnippetNames(files))
            .catch(console.error);
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
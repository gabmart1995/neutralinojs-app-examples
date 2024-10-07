import { extensions, filesystem } from "@neutralinojs/lib";
import { extension } from "../events";

const loadFiles: () => Promise<string[]> = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const homeDirectory = sessionStorage.getItem('home_directory') ?? '';
            await extensions.dispatch(extension, 'join', [homeDirectory, 'neu-files']);
            
            setTimeout(async () => {
                // console.log(sessionStorage.getItem('path'));
                const files = await filesystem.readDirectory(sessionStorage.getItem('path') ?? '');   
                const names = files.map(file => file.entry);
                
                // console.log(files);
    
                // establecemos el nombre de los archivos
                resolve(names);
            }, 1500);
            
        } catch (error) {
            // console.log('error')
            reject(error);
        }
    });  
};

export {
    loadFiles
}
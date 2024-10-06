import * as monaco from 'monaco-editor';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FileContext } from '../context/file_context';
import { extensions, filesystem, os } from '@neutralinojs/lib';
import { extension } from '../events';

const SnippetEditor = () => {
    const fileContext = useContext(FileContext);
    
    const monacoContainer = useRef<HTMLDivElement | null>(null)
    const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

    /** permite verificar el tipo de archivo */
	const getLanguageEditor = useCallback((snippetName: string) => {
		const extension = snippetName.split('.')[snippetName.split('.').length - 1];
		const EXTENSIONS = Object.freeze({
			js: 'js',
			ts: 'ts',
			css: 'css',
			html: 'html',
			json: 'json',
			py: 'py'
		});

		switch (extension) {
			case EXTENSIONS.js:
				return 'javascript';

			case EXTENSIONS.ts:
				return 'typescript';
			
			case EXTENSIONS.html:
				return EXTENSIONS.html;

			case EXTENSIONS.css:
				return EXTENSIONS.css;

			case EXTENSIONS.json:
				return EXTENSIONS.json;

			case EXTENSIONS.py:
				return 'python';

			default:
				return 'txt';
		}
	}, []);

    // crea la instancia del editor
    useEffect(() => {
        // console.log({fileContext, path: sessionStorage.getItem('path')});

        if (!monacoContainer.current || !fileContext.selectedSnippet) return;
        
        // crea una instancia del editor
        // sino la actualiza
        if (!editorInstance) {
            const editor = monaco.editor.create(monacoContainer.current, {
                theme: 'vs-dark',
                language: getLanguageEditor(fileContext.selectedSnippet?.name ?? ''),
                fontSize: 20,
                value: fileContext.selectedSnippet?.code ?? '',
            });

            setEditorInstance(editor);
        
        } else {
            let value = '';

            if (fileContext.selectedSnippet) value = fileContext.selectedSnippet.code ?? '';
            
            // actualiza el modelo
            const model = editorInstance.getModel();
            
            if (model) {
                // cambia el lenguaje
                monaco.editor.setModelLanguage(
                    model, 
                    getLanguageEditor(fileContext.selectedSnippet?.name ?? '')
                )
                
                // cambia el contenido
                model.setValue(value);
            }            
        }

    }, [fileContext.selectedSnippet]);

    // efecto para guardar archivo
    useEffect(() => {
        if (!editorInstance || !monacoContainer.current) return;

        // anadimos el evento de captura de teclado
        // salva el archivo Ctrl + S 	
        monacoContainer.current.addEventListener('keyup', async event => {
            if (event.ctrlKey && event.key === 's') {
                try {
                    const contentFile = editorInstance.getValue();  
                    const homeDirectory = sessionStorage.getItem('home_directory') ?? '';
                    await extensions.dispatch(
                        extension, 
                        'join', 
                        [homeDirectory, 'neu-files', fileContext.selectedSnippet?.name ?? '']
                    );

                    // escribimos los archivos
                    setTimeout(async () => {
                        const path = sessionStorage.getItem('path') ?? '';
                        await filesystem.writeFile(path, contentFile);
                        
                        console.log('saved');
                        
                        await os.showNotification('exito', 'Archivo guardado con exito');
                    }, 1500);

                } catch (error) {
                    console.error(error);

                }
            }
        });
    }, [editorInstance, fileContext]);

    // validamos si existe un snippet seleccionado
    if (!fileContext.selectedSnippet) return (<div>No snippet selected</div>);
        
    return (<div className="editor" ref={monacoContainer}></div>);
}

export default SnippetEditor;
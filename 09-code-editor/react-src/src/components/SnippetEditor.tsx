import * as monaco from 'monaco-editor';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FileContext } from '../context/file_context';
import { extensions, filesystem, os } from '@neutralinojs/lib';
import { extension } from '../events';
import {TfiPencil} from 'react-icons/tfi'
import toast from 'react-hot-toast';

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

    /** manejador del teclado del editor */
    const handleKeyUp: (event: React.KeyboardEvent<HTMLDivElement>) => void = async event => {
        if (!editorInstance) return;
        
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
                    
                    // console.log('saved');
                    
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
                console.error(error);

            }
        }
    } 

    // crea la instancia del editor
    useEffect(() => {
        // console.log({fileContext, editorInstance, value: monacoContainer.current});

        if (!monacoContainer.current) return;
        
        // crea una instancia del editor
        // sino la actualiza
        if (!editorInstance) {
            console.log('create editor');
            
            const editor = monaco.editor.create(monacoContainer.current, {
                theme: 'vs-dark',
                language: getLanguageEditor(fileContext.selectedSnippet?.name ?? ''),
                fontSize: 20,
                value: fileContext.selectedSnippet?.code ?? '',
            });

            setEditorInstance(editor);
        
        } else if (editorInstance && fileContext.selectedSnippet) {
            console.log('update editor');
            
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

        // se retorna una funcion que actua al desmontar el componente 
        return () => {
            console.log('editor unmount')

            // elimina el contexto del editor
            // para crear uno nuevo
            if (editorInstance) editorInstance.dispose();        

            setEditorInstance(null);
        };

    }, [fileContext.selectedSnippet]);

    // validamos si existe un snippet seleccionado
    if (!fileContext.selectedSnippet) return (
        <TfiPencil className="text-9xl text-neutral-500" />
    );
        
    return (
        <div 
            className="editor" 
            ref={monacoContainer}
            onKeyUp={handleKeyUp}
        ></div>);
}

export default SnippetEditor;